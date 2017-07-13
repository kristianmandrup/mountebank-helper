const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const chaiSubset = require('chai-subset');
chai.should();

chai.use(chaiAsPromised);
chai.use(chaiSubset);


// import the mountebank helper library
const mbHelper = require('../src/index');
const Imposter = mbHelper.Imposter;
const startMbServer = mbHelper.startMbServer;
const fetch = require('node-fetch');


describe('Posting to MounteBank', function () {
  before(function startUpMounteBank() {
    return startMbServer(2525);
  });

  it('Should return a resolved promise on an is request', function () {
    const sampleResponse = {
      'uri': '/pets/123',
      'verb': 'PUT',
      'res': {
        is: {
          'statusCode': 200,
          'responseHeaders': {
            'Content-Type': 'application/json'
          },
          'responseBody': JSON.stringify({
            'somePetAttribute': 'somePetValue'
          })
        }
      }
    };

    const testImposter = new Imposter({
      'imposterPort': 3000
    });
    testImposter.addRoute(sampleResponse);
    return testImposter.postToMountebank().should.be.eventually.fulfilled.and.have.property('status').and.equal(201);
  });

  it('Should return a resolved promise on a proxy request', function () {
    const sampleResponse = {
      'uri': '/pets/123',
      'verb': 'PUT',
      'res': {
        proxy: {
          mode: 'proxyOnce',
          to: 'https://httpbin.org/status/418'
        }
      }
    };

    const testImposter = new Imposter({
      'imposterPort': 3000
    });
    testImposter.addRoute(sampleResponse);
    return testImposter.postToMountebank().should.be.eventually.fulfilled.and.have.property('status').and.equal(418);
  });
});
