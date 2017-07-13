const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const chaiSubset = require('chai-subset');
chai.should();

chai.use(chaiAsPromised);
chai.use(chaiSubset);


// import the mountebank helper library
const mbHelper = require('../../src/index');
const Imposter = mbHelper.Imposter;
const startMbServer = mbHelper.startMbServer;
const fetch = require('node-fetch');


describe('Posting to MounteBank: Proxy once', function () {
  before(function startUpMounteBank() {
    return startMbServer(2525);
  });


  it('to petstore API', function () {
    const sampleResponse = {
      'uri': '/pets/123',
      'verb': 'POST',
      'res': {
        proxy: {
          mode: 'proxyOnce',
          to: 'http://api.petstore.com/pets'
        }
      }
    };

    const testImposter = new Imposter({
      'imposterPort': 3000
    });
    testImposter.addRoute(sampleResponse);
    return testImposter.postToMountebank().then(res => {
      console.log({
        status: res.status,
        statusText: res.statusText
      })

      res.should.have.property('status').and.equal(201);
    })
  });
});
