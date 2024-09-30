from machine import Pin, ADC, WDT, reset
import utime
import network
import umqtt.simple
import secrets

failcount = 0

def connect(wlan):
    networks = secrets.networks

    for network in networks:
        wlan.active(False)
        wlan.active(True)
        try:
            wlan.connect(network[0], network[1])
        except Exception as e:
            print("unexpected error occurred while connecting to access point")
            reset()

        print(f"trying {network[0]}.")
        count = 0
        while not wlan.isconnected():
            utime.sleep(1)
            print("...")
            count += 1
            if (count > 30):
                break
        if wlan.isconnected():
            print("wifi connected.")
            return wlan
    print("failed to connect to any network")
    reset()

def send(mqt, name, status):
    global failcount
    try:
        mqt.publish("pump/%s/running"%name, str(status))
    except Exception:
        print("failed to send status...")
        failcount += 1
    if failcount > 10:
        print("fail count > 10, resetting")
        reset()
    failcount = 0

def run(wlan, mqt):
    adc = [ADC(Pin(32)),
       ADC(Pin(33)),
       ADC(Pin(34)),
       ADC(Pin(35)),
       ADC(Pin(36)),
       ADC(Pin(39))]

    names = ["p1","p2","p3","p4","al","r"]
    states = [False]*len(adc)
    # set attenuation
    [a.atten(ADC.ATTN_11DB) for a in adc]
    
    count = 0

    while(True):
        utime.sleep(1)

        if not wlan.isconnected():
            reset()

        vals = [a.read() for a in adc]
        print(vals)
        ref = vals[-1]
        
        turnon = [v < ref-500 for v in vals]
        turnoff = [v < ref-200 for v in vals]

        old_states = states
        
        states = [a or b for a,b in zip(states, turnon)]
        states = [a and b for a,b, in zip(states, turnoff)]
        
        count += 1
        
        for ix,s in enumerate(states):
            if s == old_states[ix] and count < 10:
                continue
            if names[ix] in ['r','al']:
                continue
            send(mqt, names[ix], s)
            #mqt.publish("pump/%s/running"%names[ix], str(s))

        if count >= 10:
            count = 0
            
        if all(states[0:3]) and not all(old_states[0:3]):
            send(mqt, "al", True)
            #mqt.publish("pump/al/running", str(True))
        if not all(states[0:3]) and all(old_states[0:3]):
            send(mqt, "al", False)
            #mqt.publish("pump/al/running", str(False))

wlan = network.WLAN(network.STA_IF)
connect(wlan)

print("connecting to mqtt")
mqt = umqtt.simple.MQTTClient("pump",secrets.mqtt.host,secrets.mqtt.port,
    user=secrets.mqtt.user,password=secrets.mqtt.password)
try:
    mqt.connect()
except Exception as e:
    print("failed to connect to mqtt server")
    #reset()
print("running...")
run(wlan, mqt)

reset()
