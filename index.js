var Service, Characteristic;

const fetch = require('node-fetch');

module.exports = function(homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory("@garytee/homebridge-nodemcu-roomba564", "Roomba564", Roomba564Accessory);
}

// var roomba_state = 0;


function Roomba564Accessory(log, config) {

    // this.log        = log;
    // this.name       = config["name"];
    // this.hostname   = config["hostname"];
    // this.model      = config["model"];

  this.log = log;
  this.service = 'Switch';

  this.name = config['name'];
  this.hostname = config["hostname"];
  this.model = config["model"];
  this.onCommand = config['on'];
  this.offCommand = config['off'];
  this.stateCommand = config['state'];
  this.onValue = config['on_value'] || "playing";
  this.onValue = this.onValue.trim().toLowerCase();
  this.exactMatch = config['exact_match'] || true;

    log("Initialised Roomba with Name: [%s] Hostname: [%s] Model: [%s]", this.name, this.hostname, this.model);
}




Roomba564Accessory.prototype.matchesString = function(match) {
  if(this.exactMatch) {
    return (match === this.onValue);
  }
  else {
    return (match.indexOf(this.onValue) > -1);
  }
}


Roomba564Accessory.prototype.setState = function(powerOn, callback) {
  var accessory = this;
  var state = powerOn ? 'on' : 'off';
  var prop = state + 'Command';
  var command = accessory[prop];
//   var command = accessory[prop];

//   var stream = fetch(`${this.hostname}/clean`)

//   var stream = fetch(command, accessory.ssh);


  var stream = fetch(`${this.hostname}/${command}`)
                .then(response => response.json())
                .then(data => {
                    log("Roomba started");
                    log(data);
                    callback();
                })


//                 .catch(err => {
//                     log("Failed to start roomba");
//                     log(err);
//                     callback(err);
//                 });

  stream.on('error', function (err) {
    accessory.log('Error: ' + err);
    callback(err || new Error('Error setting ' + accessory.name + ' to ' + state));
  });

  stream.on('finish', function () {
    accessory.log('Set ' + accessory.name + ' to ' + state);
    callback(null);
  });


//   .then(response => {
//     if(response.ok){
//       response.json().then((data) => {
//         console.log(data)
//       });  
//     }else{
//       throw 'There is something wrong'
//     }
//   }).
//   catch(error => {
//       console.log(error);
//   });


}



Roomba564Accessory.prototype.getState = function(callback) {
  var accessory = this;
  var command = accessory['stateCommand'];



  var stream = fetch(`${this.hostname}/${command}`)
                .then(response => response.json())
                .then(data => {
                    log("Roomba started");
                    log(data);
                    callback();
                })


//                 .catch(err => {
//                     log("Failed to start roomba");
//                     log(err);
//                     callback(err);
//                 });

  stream.on('error', function (err) {
    accessory.log('Error: ' + err);
    callback(err || new Error('Error getting state of ' + accessory.name));
  });

  stream.on('data', function (data) {
    var state = data.toString('utf-8').trim().toLowerCase();
    accessory.log('State of ' + accessory.name + ' is: ' + state);
    callback(null, accessory.matchesString(state));
  });


//   var stream = fetch(`${this.hostname}/state`)

//   stream.on('error', function (err) {
//     accessory.log('Error: ' + err);
//     callback(err || new Error('Error getting state of ' + accessory.name));
//   });

//   stream.on('data', function (data) {
//     var state = data.toString('utf-8').trim().toLowerCase();
//     accessory.log('State of ' + accessory.name + ' is: ' + state);
//     callback(null, accessory.matchesString(state));
//   });

// fetch(`${this.hostname}/dock`)
//   .then(response => {
//     if(response.ok){
//       response.json().then((data) => {
//         console.log(data)
//       });  
//     }else{
//       throw 'There is something wrong'
//     }
//   }).
//   catch(error => {
//       console.log(error);
//   });


}

Roomba564Accessory.prototype.getServices = function() {
  var informationService = new Service.AccessoryInformation();
  var switchService = new Service.Switch(this.name);

  informationService
  .setCharacteristic(Characteristic.Manufacturer, 'Roomba Manufacturer')
  .setCharacteristic(Characteristic.Model, 'Roomba Model')
  .setCharacteristic(Characteristic.SerialNumber, 'Roomba Serial Number');

  var characteristic = switchService.getCharacteristic(Characteristic.On)
  .on('set', this.setState.bind(this));

  if (this.stateCommand) {
    characteristic.on('get', this.getState.bind(this))
  };

  return [switchService];
}