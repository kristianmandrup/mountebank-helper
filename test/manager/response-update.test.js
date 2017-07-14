const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const chaiSubset = require('chai-subset');
const myUtil = require('../../util/util');
chai.should();

chai.use(chaiAsPromised);
chai.use(chaiSubset);
const expect = chai.expect;

const {
  routes
} = require('./routes')

// import the mountebank helper library
const {
  createImposterManager,
  ImposterManager
} = require('../../src/manager');

const testStubs = require('../testStubs');

function pretty(obj) {
  return JSON.stringify(obj, null, 2)
}

describe('ImposterManager', function () {
  const manager = new ImposterManager().create()

  it('has a response object', function () {
    expect(manager.response).to.be.defined
  })

  describe('Response', function () {
    const response = manager.response

    describe('No matching response', function () {
      it('updateHeaders fails', function () {
        expect(() => response.updateHeaders('new body', '/')).to.throw
      })

      it('updateBody fails', function () {
        expect(() => response.updateBody('new body', '/')).to.throw
      })

      it('updateCode fails', function () {
        expect(() => response.updateCode(200, '/')).to.throw
      })

      it('updateStasus (alias) fails', function () {
        expect(() => response.updateStatus(200, '/')).to.throw
      })
    })
  })

  describe('Matching response', function () {
    manager.addRoute(routes.named)

    const fresh = {
      body: 'new body',
      headers: {
        'Content-Type': 'text'
      }
    }

    it('updateHeaders succeeds', function () {
      expect(() => response.updateHeaders(fresh.headers, '/named')).to.not.throw
    })

    it('updateBody succeeds', function () {
      expect(() => response.updateBody(fresh.body, '/named')).to.not.throw
    })

    it('updateCode succeeds', function () {
      expect(() => response.updateCode(201, '/named')).to.not.throw
    })

    it('updateStasus (alias) succeeds', function () {
      expect(() => response.updateStatus(201, '/named')).to.not.throw
    })
  })
})
