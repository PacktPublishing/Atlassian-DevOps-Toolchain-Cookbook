require('dotenv').config();
const logging = require('./modules/logging');
const callapi = require('./modules/callapi');
const assert = require ('assert').strict;
const sinon = require('sinon');

const WTOKEN = process.env.openWeatherToken;

describe('API Functions Tests', function() {

  it('Should call Weather API successfully',function() {
    callapi.weather('Atlanta,US',WTOKEN)
      .on('error', function(err) {
        assert.fail(err);
      })
      .on('data', function(result) {
        assert.deepEqual(result.name,'Atlanta');
        assert.deepEqual(result.sys.country.toLowerCase(),'us');
        assert.deepEqual(result.coord.lon,-84.388);
        assert.deepEqual(result.coord.lat,33.749);
        assert.deepEqual(result.sys.id,2006620);
      });
  });

  it('Should call Random API successfully',function() {
    callapi.random(0,100)
      .on('error', function(err) {
        assert.fail(err);
      })
      .on('data', function(result) {
        assert.deepEqual(result.status,'success');
        assert.deepEqual(result.min,0);
        assert.deepEqual(result.max,100);
      });

  });

  it('Should Query Game Server State successfully',function() {
    callapi.query_game('minecraft','v.phenakism.com', 25565, 0)
      .on('error', function(error) {
        assert.fail(error);
      })
      .on('state', function(state) {
        assert.deepEqual(state.maxplayers, 10);
        assert.deepEqual(state.password, false);
        //console.log(state);
      });

  });
});

describe('Logging Functions Test', function() {

  const message = 'Test Message.';
  const logspy = sinon.spy (console, 'log');
  const errspy = sinon.spy (console, 'error');

  after(function() {
    logspy.restore();
    errspy.restore();
  });

  it('Should report an Info log', function () {
    logging.info(message);
    assert(logspy.calledWith('[INFO] Test Message.'));
  });

  it('Should report an Error log', function () {
    logging.error(message);
    assert(errspy.calledWith('[ERROR] Test Message.'));
  });

  it('Should report an Debug log', function () {
    logging.debug(message);
    assert(errspy.calledWith('[DEBUG] Test Message.'));
  });

});
