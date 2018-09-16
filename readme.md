# ATACK Donation Kiosk

## How it works

The donation kiosk software is comprised of three main components: the credit card (magtek) card reader, the serial interface to the user input provided through an arduino micro, and the payment authentication handled by Authorize.net APIs. The following sections will explain each of these sections.

## Payment Cards
NodeJS Modules used - node-hid-stream, body-parser, events, redis


## Payment Kiosk
NodeJS Modules used - serialport, redis

## Payment Authentication
NodeJS Modules used - authorizenet, redis

## How to operate this
Start by cloning this repository to your local machine. This was developed using NodeJS version 9.11.1 and NPM version 5.6.0, so these should be considered when running the software. Additionally, those looking to run this should realize that it was developed for use on a Qualcomm DragonBoard410c, with a pre-installed debian-variant operating system (linaro). With these considerations underway, one can install the dependent node packages using `npm i ` while in the main directory of the newly-cloned repository. The software can be run by invoking Node through a command such as `node index.js`.