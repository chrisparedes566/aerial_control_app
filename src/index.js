const express = require('express')
const app = express()
const port = process.env.PORT || 4000;

const cons = require('consolidate');
const path = require('path');
const request = require('request');
const bodyParser = require('body-parser');
const session = require('express-session');
//const redis = require('redis');
//var redisStore = require('connect-redis').default;
//var client  = redis.createClient();

app.use(session({
  secret: 'SECRET_KEY',
  // create new redis store.
  //store: new redisStore({ host: 'localhost', port: 6379, client: client}),
  saveUninitialized: false,
  resave: true,
  cookie: {
      secure: false, // if true only transmit cookie over https
      httpOnly: false
  }
}));


// view engine setup
app.engine('html', cons.swig)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(express.urlencoded({extended: false}));
app.use(express.json());


const Wyze = require('wyze-api')
const Logger = require("@ptkdev/logger")
const logger = new Logger()

const options = {
  username: /*process.env.username*/ 'omniglobalenterprise@gmail.com',
  password: /*process.env.password*/ 'Aerial123!',
  keyId: /*process.env.keyId*/ '9696ce95-d2fc-4444-a08f-004411b5cd5d',
  apiKey: /*process.env.apiKey*/ 'qMIJKSwE2HdkWYVHQDLwBGYaknupNiphL8V2yTQbbuuxjDcwyWJfJgacCwPs',
  persistPath: "./",
  logLevel: "none"
}

function checkLogin(req, res, next) {
  //check login here
  if (req.session.reservation_data) {
      next();
  } else {
      return res.redirect(req.baseUrl + "/");
  }
}

app.get('/', (req, res) => {
  if(req.session.reservation_data){
    res.render('device-dashboard')
  } else {
    res.render('login')
  }
})

app.get('/rooms', checkLogin, (req, res) => {
  res.render('rooms')
})

app.get('/controller', checkLogin, (req, res) => {
  res.render('controller')
})

app.get('/rooms/backyard', checkLogin, (req, res) => {
  res.render('room')
})

app.get('/device-dashboard', checkLogin, (req, res) => {
    res.render('device-dashboard')
})

app.post('/guest-login', (req, res) => {

  var reservationID = req.body.reservation_id;
  var reservationEmailOrPhone = req.body.email_or_phone;
  var foundValue = 0;

  ; (async () => {

    var options = {
      url: 'https://app.hosthub.com/api/2019-03-01/rentals/MgmyZyJNaq/calendar-events',
      method: 'GET',
      headers: {
        'Authorization': 'ZTU4OWNkZjctMGMyMS00NTRhLWFkYTMtMmFmMDU0MDNlNmNl'
      }
    };
  
   request(options, function (error, response, body) {
       if (!error) {
        var array = JSON.parse(body).data;

          for (var i = 0; i < array.length; i++) { 
              if (array[i].reservation_id == reservationID) { 
                foundValue = array[i];
                break;
              }
          }

          if(foundValue !== 0 && ((foundValue.guest_email === reservationEmailOrPhone) || (foundValue.guest_phone === reservationEmailOrPhone) )){
            function convertDates(date){
              var myDate = date.split("-");
              var newDate = new Date( myDate[0], myDate[1] - 1, myDate[2]);
              formattedDate = newDate.getTime() / 1000;
              return formattedDate;
            }
            
            let now = Date.now() / 1000;
            var startDate = convertDates(foundValue.date_from) + 12*3600;
            var endDate = convertDates(foundValue.date_to) + 11*3600;

            if (now >= startDate && now <= endDate){
              req.session.reservation_data = foundValue;
              res.send( JSON.stringify({ 'status_code' : '100', reservation_data : foundValue }) )

            } else if( now <= startDate ) {
              res.send( JSON.stringify({ 'status_code' : '110', 'status' : 'We found your reservation! But sadly its it\'s too early for checkin. Please try again later.' }) )
            }  else if(now >= endDate) {
              res.send( JSON.stringify({ 'status_code' : '120', 'status' : 'We found your reservation! But sadly its past the checkout date.' }) )
            }

          } else if(foundValue !== 0 && (foundValue.guest_email !== reservationEmailOrPhone && foundValue.guest_phone !== reservationEmailOrPhone)){
            res.send( JSON.stringify({ 'status_code' : '200', 'status' : 'Reservation found, but email or phone does not match. Please try another email or phone.' }) )
          } else if(foundValue === 0){
            res.send( JSON.stringify({ 'status_code' : '300', 'status' : 'Reservation not found.' }) )
          }

       } else {
          console.log(error);
       }
   })

  })()
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

app.post('/get-neon-status', (req, res) => {
  const wyze = new Wyze(options, logger)

; (async () => {
  let device, state, result

  // Get a Wyze Bulb by name and turn it off.
  device = await wyze.getDeviceByName('Exterior Wall Lights')
  state = device.device_params.switch_state

  res.send( JSON.stringify(state) )

  })()
})

app.post('/get-landscape-status', (req, res) => {
  const wyze = new Wyze(options, logger)

; (async () => {
  let device, state, result

  // Get a Wyze Bulb by name and turn it off.
  device = await wyze.getDeviceByName('Landscape Lights')
  state = device.device_params.switch_state

  res.send( JSON.stringify(state) )

  })()
})

app.post('/get-string-status', (req, res) => {
  const wyze = new Wyze(options, logger)

; (async () => {
  let device, state, result

  // Get a Wyze Bulb by name and turn it off.
  device = await wyze.getDeviceByName('String Lights')
  state = device.device_params.switch_state

  res.send( JSON.stringify(state) )

  })()
})


app.post('/pool-led-status', (req, res) => {
  const wyze = new Wyze(options, logger)

; (async () => {
  let device, state, result

  // Get a Wyze Bulb by name and turn it off.
  device = await wyze.getDeviceByName('Pool LEDs')
  state = device.device_params.switch_state

  res.send( JSON.stringify(state) )

  })()
})


app.post('/smart-plug', (req, res) => {
    const wyze = new Wyze(options, logger)

  ; (async () => {
    let device, state, result

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

app.post('/neon-light-switch', (req, res) => {
  const wyze = new Wyze(options, logger)

; (async () => {
  let device, state, result

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


app.post('/landscape-light-switch', (req, res) => {
  const wyze = new Wyze(options, logger)

; (async () => {
  let device, state, result

  // Get a Wyze Bulb by name and turn it off.
  device = await wyze.getDeviceByName('Landscape Lights')
  state = device.device_params.switch_state

  if(state === 1){
      await wyze.plugTurnOff(device.mac, device.product_model)
  } else {
      await wyze.plugTurnOn(device.mac, device.product_model)
  }

  updatedDevice = await wyze.getDeviceByName('Landscape Lights')
  
  console.log(updatedDevice)

  res.send( updatedDevice )

  })()
})

app.post('/string-light-switch', (req, res) => {
  const wyze = new Wyze(options, logger)

; (async () => {
  let device, state, result

  // Get a Wyze Bulb by name and turn it off.
  device = await wyze.getDeviceByName('String Lights')
  state = device.device_params.switch_state

  if(state === 1){
      await wyze.plugTurnOff(device.mac, device.product_model)
  } else {
      await wyze.plugTurnOn(device.mac, device.product_model)
  }

  updatedDevice = await wyze.getDeviceByName('String Lights')
  
  console.log(updatedDevice)

  res.send( updatedDevice )

  })()
})

app.post('/pool-led-switch', (req, res) => {
  const wyze = new Wyze(options, logger)

; (async () => {
  let device, state, result

  // Get a Wyze Bulb by name and turn it off.
  device = await wyze.getDeviceByName('Pool LEDs')
  state = device.device_params.switch_state

  if(state === 1){
      await wyze.wallSwitchPowerOff(device.mac, device.product_model)
  } else {
      await wyze.wallSwitchPowerOn(device.mac, device.product_model)
  }

  updatedDevice = await wyze.getDeviceByName('Pool LEDs')
  
  console.log(updatedDevice)

  res.send( updatedDevice )

  })()
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})