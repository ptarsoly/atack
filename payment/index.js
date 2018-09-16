// card swipe in here

const HIDStream = require('node-hid-stream').KeyboardLines;
var bodyParser = require('body-parser');
const EventEmitter = require('events');

const cardInfo = new EventEmitter();

let device;

try {
    device = new HIDStream({ vendorId: 2049, productId: 1 }); // reader init
} catch (error) {
    console.log(error);
    return;
}



device.on('data', (data) => {

    cardInfo.emit('number','5424000000000015');
});

module.exports = cardInfo;