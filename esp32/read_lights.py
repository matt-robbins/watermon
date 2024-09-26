from machine import Pin, ADC
import utime
import network
import umqtt.simple

wlan = network.WLAN(network.STA_IF)
wlan.active(True)
wlan.connect("goldjeep", "beepbeep")
server = ("192.168.1.21",5099)
#"375lincoln.nyc","user":"launmon","pass":"flower-kayak-pacem721!"
mqt = umqtt.simple.MQTTClient("pump","375lincoln.nyc",1883,
    user="launmon",password="flower-kayak-pacem721!")
mqt.connect()

adc = [ADC(Pin(32)),
       ADC(Pin(33)),
       ADC(Pin(34)),
       ADC(Pin(35)),
       ADC(Pin(36)),
       ADC(Pin(39))]

names = ["p1","p2","p3","p4","al","r"]

states = [False]*len(adc)
       

[a.atten(ADC.ATTN_11DB) for a in adc]


print("hi")
count = 0
while not wlan.isconnected():
    utime.sleep(1)
    print("...")
    count += 1
    if (count > 30):
        reset()

print("wifi connected.")

count = 0

while(True):
    utime.sleep(1)

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
        if names[ix] == 'r':
            continue
        mqt.publish("pump/%s/running"%names[ix], str(s))

    if count >= 10:
        count = 0
