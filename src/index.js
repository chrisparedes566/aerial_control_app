const express = require('express')
const app = express()
const port = process.env.PORT || 4000;

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
  username: /*process.env.username*/ 'omniglobalenterprise@gmail.com',
  password: /*process.env.password*/ 'Aerial123!',
  keyId: /*process.env.keyId*/ '05f07a18-36bf-4088-8945-36595c60447b',
  apiKey: /*process.env.apiKey*/ 'BMdu9FrzUjwRrgoGOZyeNUoX1CoWZisqs8Gl1uejnG3LhbubBIwKjYtJiave',
  persistPath: "./",
  logLevel: "none"
}

app.get('/', (req, res) => {
    res.render('index')
})

app.get('/rooms', (req, res) => {
  res.render('rooms')
})

app.get('/controller', (req, res) => {
  res.render('controller')
})

app.get('/rooms/backyard', (req, res) => {
  res.render('room')
})

app.post('/get-status', (req, res) => {
  const wyze = new Wyze(options, logger)

; (async () => {
  let device, state, result

  // Get a Wyze Bulb by name and turn it off.
  device = await wyze.getDeviceByName('Exterior Wall Lights')
  state = device.device_params.switch_state

  res.send( JSON.stringify(state) )

  })()
})

app.post('/smart-plug', (req, res) => {
    const wyze = new Wyze(options, logger)

  ; (async () => {
    let device, state, result

    // Get all Wyze devices
    //const devices = await wyze.getDeviceList()
    //console.log(devices)

    // Get a Wyze Bulb by name and turn it off.
    device = await wyze.getDeviceByName('Exterior Wall Lights')
    state = device.device_params.switch_state

    if(state === 1){
        await wyze.plugTurnOff(device.mac, device.product_model)
    } else {
        await wyze.plugTurnOn(device.mac, device.product_model)
    }

    updatedDevice = await wyze.getDeviceByName('Exterior Wall Lights')
    
    console.log(updatedDevice)

    res.send( updatedDevice )

    //console.log(`${device.nickname} is ` + state + `.`)

    // Get the state of a Wyze Sense contact sensor
    //device = await wyze.getDeviceByName('Front Door')
    //state = await wyze.getDeviceState(device)
    //console.log(`${device.nickname} is ${state}`)

    })()
})

app.post('/smart-plug', (req, res) => {
  const wyze = new Wyze(options, logger)

; (async () => {
  let device, state, result

  // Get all Wyze devices
  //const devices = await wyze.getDeviceList()
  //console.log(devices)

  // Get a Wyze Bulb by name and turn it off.
  device = await wyze.getDeviceByName('Exterior Wall Lights')
  state = device.device_params.switch_state

  if(state === 1){
      await wyze.plugTurnOff(device.mac, device.product_model)
  } else {
      await wyze.plugTurnOn(device.mac, device.product_model)
  }

  updatedDevice = await wyze.getDeviceByName('Exterior Wall Lights')
  
  console.log(updatedDevice)

  res.send( updatedDevice )

  })()
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})