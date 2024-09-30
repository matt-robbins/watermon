
# replace with your own... any number of networks.
networks = [("nw1", "pw1"),
            ("nw2", "pw2")]

class Mqtt():
    def __init__(self, host, port, user, password):
        self.host = host
        self.port = port
        self.user = user
        self.password = password
        
mqtt = Mqtt(host="host.com",port=1883, user="user", password="pw")