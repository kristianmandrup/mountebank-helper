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

function testManager(manager, config = {}) {
  expect(manager).to.be.defined
  expect(manager.routes.size).to.equal(0)
  expect(manager.config).to.deep.equal(config)
}

function testLogging(manager, flag) {
  expect(manager.io).to.be.equal(console)
  expect(manager.logging).to.be.equal(flag)
}

function testRoute(manager, route, name) {
  let routes = Array.from(manager.routes)
  expect(routes).to.include(name)
}

describe('ImposterManager', function () {
  describe('create', function () {
    it('default', function () {
      const manager = new ImposterManager()
      testManager(manager)
      testLogging(manager)
    })

    it('with logging', function () {
      const manager = new ImposterManager(null, {
        logging: true
      })
      testManager(manager)
      testLogging(manager, true)
    })

    it('with config', function () {
      const defaults = {
        server: {
          port: 2424
        }
      }
      const config = {
        imposterPort: 3000,
        defaults
      }
      const manager = new ImposterManager(config)
      testManager(manager, config)
      testLogging(manager)
      expect(manager._defaults).to.equal(defaults)
    })
  })

  describe('addRoute', function () {
    it('fails if Imposter not created', function () {
      const manager = new ImposterManager(null, {
        logging: true
      })
      testManager(manager)

      const name = 'my-custom'
      const route = routes.custom

      // fails since imposter not yet created
      expect(() => manager.addRoute(route, name)).to.throw
    })

    it('adds when Imposter has been created', function () {
      const manager = new ImposterManager(null, {
        logging: true
      })
      testManager(manager)

      const name = 'my-custom'
      const route = routes.custom
      manager.create()
      // adds routes since imposter has been created
      manager.addRoute(route, name)
      testRoute(manager, route, name)
    })

    it('adds with generated name', function () {
      const manager = new ImposterManager(null, {
        logging: true
      })
      testManager(manager)

      const route = routes.custom
      manager.create()
      // adds routes since imposter has been created
      manager.addRoute(route)
      // name: GET:/custom
      let name = manager.lastRouteName
      expect(name).to.be.equal('GET:/custom')
      testRoute(manager, route, name)
    })

    it('adds with explicit name on route', function () {
      const manager = new ImposterManager(null, {
        logging: true
      })
      testManager(manager)

      const route = routes.named
      manager.create()
      // adds routes since imposter has been created
      manager.addRoute(route)
      // name: my-named-route
      let name = manager.lastRouteName
      expect(name).to.be.equal('my-named-route')
      testRoute(manager, route, name)
    })
  })

  describe('addRoutes', function () {
    it('Object (k/v)', function () {
      const manager = new ImposterManager(null, {
        logging: true
      })
      testManager(manager)

      manager.create()
      // adds routes since imposter has been created
      manager.addRoutes(routes)
      // name: my-named-route
      let name = manager.lastRouteName
      expect(name).to.be.equal('my-named-route')
      testRoute(manager, routes.named, name)
      testRoute(manager, routes.custom, 'custom')
    })

    it('Array (list)', function () {
      const manager = new ImposterManager(null, {
        logging: true
      })
      testManager(manager)

      manager.create()

      let routeList = [
        routes.named,
        routes.custom
      ]

      // adds routes since imposter has been created
      manager.addRoutes(routeList)
      // name: my-named-route
      let name = manager.lastRouteName
      expect(name).to.be.equal('GET:/custom')
      testRoute(manager, routes.named, 'my-named-route')
      testRoute(manager, routes.custom, 'GET:/custom')
    })
  })

  describe('start', function () {
    it('default: works', function () {
      const manager = new ImposterManager(null, {
        logging: true
      })
      testManager(manager)

      manager.create()
      expect(() => manager.start()).to.not.throw
    })

    it('with custom port option: works', function () {
      const manager = new ImposterManager(null, {
        logging: true
      })
      testManager(manager)
      manager.create()

      const options = {
        port: 2700
      }
      expect(() => manager.start(options)).to.not.throw
    })
  })
})
