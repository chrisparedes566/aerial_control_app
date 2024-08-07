const express = require('express')
const app = express()
const port = process.env.PORT || 4000;
const cons = require('consolidate');
const path = require('path');
const request = require('request');
const bodyParser = require('body-parser');
const session = require('express-session');

if(port === 4000){
  require('dotenv').config()
}

var axios = require('axios');

const airbnb = require('airbnbapijs');
airbnb.testAuth('faketoken3sDdfvtF9if5398j0v5nui')

let August = require('august-api');

let august = new August({
  installId: process.env.YALE_ID, // Can be anything, but save it for future use on this account
  augustId : process.env.YALE_USERNAME, // Phone must be formatted +[countrycode][number] or email format
  password: process.env.YALE_PASSWORD
})

const wifi = require('node-wifi');

// Initialize wifi module
// Absolutely necessary even to set interface to null
wifi.init({
  iface: null // network interface, choose a random wifi interface if set to null
});

app.post('/connect-to-wifi', (req, res) => {
  // Connect to a network
  wifi.connect({ ssid: process.env.WIFI_SSID, password: process.env.WIFI_PASSWORD }, () => {
    console.log('Connected');
  });
})

app.post('/redirect-to-oauth-server', (req, res) => {
  res.redirect(authorizationUrl);
})

let googleApiCredentials;

app.post('/get-google-api-credentials', (req, res) => {
  ; (async () => {

    await getGoogleApiCredentials();
    res.send(googleApiCredentials)

  })()

})


async function getGoogleApiCredentials(){

        var data = JSON.stringify({
          "collection": "google-api-credentials",
          "database": "aerial-control",
          "dataSource": "aerial-control"
        });
        var config = {
          method: 'post',
          url: 'https://us-east-1.aws.data.mongodb-api.com/app/data-vefznnv/endpoint/data/v1/action/findOne',
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Request-Headers': '*',
            'api-key': process.env.MONGO_API_KEY,
            'Accept': 'application/ejson'
          },
          data: data
        };
         await axios(config)
          .then(function (response) {
            googleApiCredentials = response.data.document;
            return response.data.document;
          })
          .catch(function (error) {
              console.log(error);
          });
      
}


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
  username: process.env.WYZE_API_USERNAME,
  password: process.env.WYZE_API_PASSWORD,
  keyId: process.env.WYZE_KEY_ID,
  apiKey: process.env.WYZE_API_KEY,
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

function checkAdminLogin(req, res, next) {
  //check login here
  if (req.session.admin_data) {
      next();
  } else {
      return res.redirect(req.baseUrl + "/admin-login");
  }
}

app.get('/', (req, res) => {
  // Store state in the session
  if(req.session.reservation_data){
    res.render('device-dashboard')
  } else {
    res.render('login')
  }
})

app.get('/admin', (req, res) => {
  res.render('admin-login')
})

app.get('/rooms', checkLogin, (req, res) => {
  res.render('rooms')
})

app.get('/home-dashboard', (req, res) => {
  res.render('home-dashboard')
})

app.get('/yale-admin', (req, res) => {
  res.render('yale-admin')
})

app.post('/yale-login', (req, res) => {

  august.authorize();

  res.send( JSON.stringify({ 'status_code' : '200', 'status' : 'Success! Please enter 6-digit verification code to continue.' }) )

})

app.post('/yale-verification', (req, res) => {

  var verificationCode = req.body.verification_code;

  august.validate(verificationCode)

  res.send( JSON.stringify({ 'status_code' : '200', 'status' : 'Success!' }) )

})

app.post('/get-yale-locks', (req, res) => {
  ; (async () => {
    let lockDetails
    
    lockDetails = await august.details()

    console.log(lockDetails)

    res.send( JSON.stringify(lockDetails) )

  })()

})

app.post('/update-google-auth-code', (req, res) => {
  ; (async () => {

          var googleApiCode = req.body.google_api_code;

          var data = JSON.stringify({
            "dataSource": "aerial-control",
            "database": "aerial-control",
            "collection": "google-api-credentials",
            "filter": {
              "_id": { "$oid": process.env.GOOGLE_CREDENTIALS_COLLECTION_ID }
            },
            "update": {
              "$set": {
                "google_api_code": googleApiCode
              }
            }
          });
          var config = {
            method: 'post',
            url: 'https://data.mongodb-api.com/app/data-vefznnv/endpoint/data/v1/action/updateOne',
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Request-Headers': '*',
              'api-key': process.env.MONGO_API_KEY,
              'Accept': 'application/ejson'
            },
            data: data
          };
          axios(config)
            .then(function (response) {
                console.log(JSON.stringify(response.data));
                updateGoogleApiTokens();
                res.send( JSON.stringify(response.data) )
            })
            .catch(function (error) {
                console.log(error);
            });

  })()

})

app.post('/update-google-api-tokens', (req, res) => {
  ; (async () => {

    updateGoogleApiTokens();
        
  })()

})

async function updateGoogleApiTokens(){

  var data = JSON.stringify({
    "collection": "google-api-credentials",
    "database": "aerial-control",
    "dataSource": "aerial-control"
  });
  var config = {
    method: 'post',
    url: 'https://us-east-1.aws.data.mongodb-api.com/app/data-vefznnv/endpoint/data/v1/action/findOne',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Request-Headers': '*',
      'api-key': process.env.MONGO_API_KEY,
      'Accept': 'application/ejson'
    },
    data: data
  };
  axios(config)
    .then(function (response) {
        var googleApiCode = response.data.document.google_api_code;
        let payload = {
          grant_type: 'authorization_code',
          code: googleApiCode,
          client_id: process.env.GOOGLE_API_CLIENT_ID,
          client_secret: process.env.GOOGLE_API_CLIENT_SECRET,
          redirect_uri: 'https://aerial-control.onrender.com',
        };
        
        axios
          .post(`https://www.googleapis.com/oauth2/v4/token`, payload, {
            headers: {
              'Content-Type': 'application/json;',
            },
          })
          .then((res) => {

            var data = JSON.stringify({
              "dataSource": "aerial-control",
              "database": "aerial-control",
              "collection": "google-api-credentials",
              "filter": {
                "_id": { "$oid": process.env.GOOGLE_CREDENTIALS_COLLECTION_ID }
              },
              "update": {
                "$set": {
                  "access_token": res.data.access_token,
                  "refresh_token": res.data.refresh_token
                }
              }
            });
            var config = {
              method: 'post',
              url: 'https://data.mongodb-api.com/app/data-vefznnv/endpoint/data/v1/action/updateOne',
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Request-Headers': '*',
                'api-key': process.env.MONGO_API_KEY,
                'Accept': 'application/ejson'
              },
              data: data
            };
            axios(config)
              .then(function (response) {
                  console.log(JSON.stringify(response.data));
              })
              .catch(function (error) {
                  console.log(error);
              });

            return res.data;
          })
          .catch((err) => console.log('err: ', err));
    })
    .catch(function (error) {
        console.log(error);
    });


}

app.post('/get-2-legged-access-token', (req, res) => {
    let client_id = process.env.AUTODESK_CLIENT_ID;
    let client_secret = process.env.AUTODESK_CLIENT_SECRET;
    let base64String = btoa(client_id + ':' + client_secret);
    var config = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept' : 'application/json',
        'Authorization' : 'Basic ' + base64String
      },
      url: 'https://developer.api.autodesk.com/authentication/v2/token',
      data: {
        grant_type : 'client_credentials',
        scope : 'data:read'
      }
    };
    axios(config)
      .then(function (response) {
          console.log(JSON.stringify(response.data));
          res.send( JSON.stringify(response.data) )
      })
      .catch(function (error) {
          console.log(error);
      });
    
})


app.post('/get-google-devices', (req, res) => {
  ; (async () => {
    await getGoogleApiCredentials();
    var access_token = googleApiCredentials.access_token;
    
    var config = {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Request-Headers': '*',
        'Authorization': 'Bearer ' + access_token
      },
      url: 'https://smartdevicemanagement.googleapis.com/v1/enterprises/' + process.env.GOOGLE_PROJECT_ID + '/devices',
    };
    axios(config)
      .then(function (response) {
          console.log(JSON.stringify(response.data));
          res.send( JSON.stringify(response.data) )
      })
      .catch(function (error) {
          console.log(error);
      });
    
    })()

})

let refreshedGoogleApiCredentials;

async function refreshGoogleApiCredentials(){

  //Get refresh token
  await getGoogleApiCredentials();
  var refresh_token = googleApiCredentials.refresh_token;

  //Get new access token using refresh token above

  var config = {
    method: 'POST',
    url: 'https://www.googleapis.com/oauth2/v4/token?client_id=' + process.env.GOOGLE_API_CLIENT_ID + '&client_secret=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&refresh_token=' + refresh_token + '&grant_type=refresh_token',
  };
  axios(config)
    .then(function (response) {
        refreshedGoogleApiCredentials = response.data;
        console.log(refreshedGoogleApiCredentials.data);
        setTimeout(function(){
          updateDBGoogleApiCredentials();
        }, 500);
        return response;
    })
    .catch(function (error) {
        console.log(error);
    });

}

app.post('/refresh-google-api-credentials', (req, res) => {
  ; (async () => {

    await refreshGoogleApiCredentials();
    setTimeout(function(){
      res.send( refreshedGoogleApiCredentials )
    }, 1000);
  })()

})

setInterval(function(){
    refreshGoogleApiCredentials();
}, 1000 * 60 * 55)

app.post('/update-google-thermostat-temp', (req, res) => {
  ; (async () => {

          await getGoogleApiCredentials();

          setTimeout(function(){
            var accessToken = googleApiCredentials.access_token
            var coolCelsius = Number(req.body.coolCelsius);
            var data = {
                "command" : "sdm.devices.commands.ThermostatTemperatureSetpoint.SetCool",
                "params" : {
                "coolCelsius" : coolCelsius
                }
            };
            var config = {
              method: 'POST',
              url: 'https://smartdevicemanagement.googleapis.com/v1/enterprises/' + process.env.GOOGLE_PROJECT_ID + '/devices/AVPHwEur0KdKJ3AGRboj7oajio8QqdeOxS71e5_W6fGZ09Bf7-ipD31g_yLzW4bSAFZFqm3e3FAOOhCXFrlWhHPyrGTNJQ:executeCommand?access_token=' + accessToken,
              contentType: 'application/json; charset=utf-8',
              dataType: 'json',
              async: false,
              data: data
            };
            console.log(data)
            axios(config)
              .then(function (response) {
                  res.send( JSON.stringify(response.data) )
              })
              .catch(function (error) {
                  console.log(error);
              });
          }, 2000)
          
  })()

})

async function updateDBGoogleApiCredentials(){

  var data = JSON.stringify({
    "dataSource": "aerial-control",
    "database": "aerial-control",
    "collection": "google-api-credentials",
    "filter": {
      "_id": { "$oid": process.env.GOOGLE_CREDENTIALS_COLLECTION_ID }
    },
    "update": {
      "$set": {
        "access_token": refreshedGoogleApiCredentials.access_token,
      }
    }
  });
  
  var config = {
    method: 'POST',
    url: 'https://data.mongodb-api.com/app/data-vefznnv/endpoint/data/v1/action/updateOne',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Request-Headers': '*',
      'api-key': process.env.MONGO_API_KEY,
      'Accept': 'application/ejson'
    },
    data: data
  };
  axios(config)
    .then(function (response) {
        console.log(JSON.stringify(response.data));
    })
    .catch(function (error) {
        console.log(error);
    });

}

let myLocks = august.locks();
setTimeout(function(){
  console.log(myLocks);
}, 4000)

app.post('/get-lock-status', (req, res) => {
  ; (async () => {
    let lockStatus = await august.status(process.env.YALE_LOCK_ID)
    res.send( JSON.stringify(lockStatus) )
  })()

})

app.post('/toggle-lock', (req, res) => {
  ; (async () => {
    let lockStatus = await august.status(process.env.YALE_LOCK_ID)
    if(lockStatus.state.locked){
      await august.unlock(process.env.YALE_LOCK_ID)
    } else {
      await august.lock(process.env.YALE_LOCK_ID)
    }
    let newLockStatus = await august.status(process.env.YALE_LOCK_ID)
    res.send( JSON.stringify(newLockStatus) )

  })()

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

app.get('/admin-dashboard', checkAdminLogin, (req, res) => {
  res.render('admin-dashboard')
})

app.post('/admin-login', (req, res) => {

    var username = req.body.username;
    var password = req.body.password;
    
    if(username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD){
      var adminData = req.session.admin_data = {
        'name' : 'Admin',
        'access_type' : 'master',
        'limitless' : true
      };
      res.send( JSON.stringify(adminData) )
    } else {
      res.send( JSON.stringify({ 'response' : 'Login failed.' }) )
    }
})

app.post('/guest-login', (req, res) => {

  var reservationID = req.body.reservation_id;
  var reservationEmailOrPhone = req.body.email_or_phone;
  var foundValue = 0;

  ; (async () => {

    var options = {
      url: 'https://app.hosthub.com/api/2019-03-01/rentals/'+ process.env.SYNCBNB_PROPERTY_ID +'/calendar-events',
      method: 'GET',
      headers: {
        'Authorization': process.env.SYNCBNB_AUTH_CODE
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

          if(foundValue !== 0 && (reservationEmailOrPhone === process.env.TEST_EMAIL)){
            req.session.reservation_data = foundValue;
            res.send( JSON.stringify(foundValue) )
            return foundValue;
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