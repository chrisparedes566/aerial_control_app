const express = require('express')
const app = express()
const port = 4000

const cons = require('consolidate');
const path = require('path');

// view engine setup
app.engine('html', cons.swig)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.use(express.static(path.join(__dirname, "public")));


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

app.get('/', (req, res) => {
    res.render('index')
})

app.post('/smart-plug', (req, res) => {
    const wyze = new Wyze(options, logger)

  ; (async () => {
    let device, state, result

    // Get all Wyze devices
    //const devices = await wyze.getDeviceList()
    //console.log(devices)

    // Get a Wyze Bulb by name and turn it off.
    device = await wyze.getDeviceByName('LED Light Switch')
    state = device.device_params.switch_state

    if(state === 1){
        await wyze.plugTurnOff(device.mac, device.product_model)
    } else {
        await wyze.plugTurnOn(device.mac, device.product_model)
    }

    updatedDevice = await wyze.getDeviceByName('LED Light Switch')
    
    console.log(updatedDevice)

    res.send( updatedDevice )

    //console.log(`${device.nickname} is ` + state + `.`)

    // Get the state of a Wyze Sense contact sensor
    //device = await wyze.getDeviceByName('Front Door')
    //state = await wyze.getDeviceState(device)
    //console.log(`${device.nickname} is ${state}`)

    })()
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})