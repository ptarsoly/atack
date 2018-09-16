// require serial port and initialize it for ttyACM0
var SerialPort = require('serialport');
var port = new SerialPort('/dev/ttyACM0', {
    baudRate: 115200
});

// setup redis
const config = require('../configRedis.json');

var redis = require('redis');
pub = redis.createClient(config),
    sub = redis.createClient(config);
const DONATIONS_INFO = "shellhacks.authorizedDonations";


const moneyValue = {
    moneyCount : 1
}

sub.on('message', (channel, message) => {
    if(channel == DONATIONS_INFO) {
        port.write('r', (err) =>{
            //something messed up
            console.log(err);
            moneyValue.moneyCount = 1;
        });
        
    }
});

port.on('data', (data) => {
    if(parseInt(data) != moneyValue.moneyCount) {
        moneyValue.moneyCount = parseInt(data);
        console.log("New money amount: "+moneyValue.moneyCount);
    }
});

sub.subscribe(DONATIONS_INFO);

module.exports = moneyValue;