const Wyze = require('wyze-api')
const Logger = require("@ptkdev/logger")
const logger = new Logger()

const options = {
  username: /*process.env.username*/ 'chrisparedes566@gmail.com',
  password: /*process.env.password*/ 'Chris6964549!',
  keyId: /*process.env.keyId*/ '2bcdf977-35ea-4b5d-a639-0be04cd2bc11',
  apiKey: /*process.env.apiKey*/ 'CJrF6G3jUhHIQzEwXRUtPTm5iUUldQiXf9CF5vORRJB9yBEgCkKJazdndAgy',
  persistPath: "./",
  logLevel: "none"
}
const wyze = new Wyze(options, logger)

  ; (async () => {
    let device, state, result

    // Get all Wyze devices
    //const devices = await wyze.getDeviceList()
    //console.log(devices)

    // Get a Wyze Bulb by name and turn it off.
    device = await wyze.getDeviceByName('Gameroom')
    state = await wyze.getDeviceState(device)
    //result = await wyze.plugTurnOff(device.mac, device.product_model)
    //console.log(state)
    console.log(`${device.nickname} is ` + state + `.`)

    // Get the state of a Wyze Sense contact sensor
    //device = await wyze.getDeviceByName('Front Door')
    //state = await wyze.getDeviceState(device)
    //console.log(`${device.nickname} is ${state}`)

  })()