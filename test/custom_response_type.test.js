const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const chaiSubset = require('chai-subset');
const myUtil = require('../util/util');
chai.should();

chai.use(chaiAsPromised);
chai.use(chaiSubset);
const expect = chai.expect;


// import the mountebank helper library
const mbHelper = require('../src/index');
const Imposter = mbHelper.Imposter;

const testStubs = require('./testStubs');

function pretty(obj) {
  return JSON.stringify(obj, null, 2)
}


describe('Route Information with custom response types', function () {
  const someImposter = new Imposter({
    'imposterPort': 3000
  });

  const predicates = [{
    deepEquals: {
      'body': 'Hello'
    }
  }]

  const PUT = {
    method: 'PUT',
    response: {
      statusCode: 200,
      responseHeaders: {
        'Content-Type': 'application/json'
      },
      responseBody: '{"/areas":"PUT"}'
    },
    predicates
  }

  const IS_ROUTE = {
    uri: '/custom',
    verb: 'PUT',
    res: {
      is: {
        statusCode: 200,
        responseHeaders: {
          'Content-Type': 'application/json'
        },
        responseBody: '{"/areas":"PUT"}'
      }
    },
    predicates
  }

  const PROXY_ROUTE = {
    uri: '/custom',
    verb: 'GET',
    res: {
      proxy: {
        mode: 'proxyOnce',
        to: 'https://httpbin.org/status/200'
      }
    },
    predicates
  }

  const GET = {
    method: 'GET',
    response: {
      mode: 'proxyOnce',
      to: 'https://httpbin.org/status/200'
    },
    predicates
  }

  it('Imposter state should work with response type: is', function () {
    someImposter.addRoute(IS_ROUTE);

    const response = someImposter.getStateResponse()
    const areas = response['/custom']
    // console.log(areas.PUT)
    areas.PUT.should.deep.equal(PUT)
  })

  it('Imposter state should work with response type: proxy', function () {
    someImposter.addRoute(PROXY_ROUTE);

    const response = someImposter.getStateResponse()
    const areas = response['/custom']
    const getResult = areas.GET
    areas.GET.should.deep.equal(GET)
  })
})
