//callapi.js
//==========

require('dotenv').config();
const WTOKEN = process.env.openWeatherToken;
const axios = require('axios');
const EventEmitter = require('events');
const Gamedig = require('gamedig');

var apicall = {
  weather: function (REQ) {
    var emitter = new EventEmitter();
    //debug
    //console.log('http://api.openweathermap.org/data/2.5/weather?q=' + REQ + '&APPID=' + TOKEN);
    axios.post('http://api.openweathermap.org/data/2.5/weather?q=' + REQ + '&APPID=' + WTOKEN)
      .then(res => {
        emitter.emit('data', res.data);
      })
      .catch(err => {
        emitter.emit('error', err);
      });
    return emitter;
  },

  random: function(LOW, HIGH) {
    var emitter = new EventEmitter();

    axios.get('https://csrng.net/csrng/csrng.php?min='+LOW+'&max='+HIGH)
      .then(res => {
        emitter.emit('data', res.data);
      })
      .catch(err => {
        emitter.emit('error', err);
      });
    return emitter;
  },

  quote: function(MODE) {
    var emitter = new EventEmitter();

    axios.get('https://zenquotes.io/api/'+MODE+'/')
      .then(res => {
        emitter.emit('data', res.data);
      })
      .catch(err => {
        emitter.emit('error', err);
      });
    return emitter;
  },

  query_game: function(TYPE, SERVER, PORT, DEBUG) {
    var emitter = new EventEmitter();
    Gamedig.query({type: TYPE,host: SERVER, port: PORT, debug: DEBUG})
      .then(state => {
        emitter.emit('state', state);
      })
      .catch(error => {
        emitter.emit('error', error);
      });
    return emitter;
  }
};

module.exports = apicall;
