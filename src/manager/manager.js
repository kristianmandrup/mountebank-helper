const mbHelper = require('..')
const Response = require('./response')

const {
  toArray,
  isObject
} = require('./helpers')

function merge(...objs) {
  return Object.assign({}, ...objs)
}

const Logger = require('../util/logger')

// create the skeleton for the imposter (does not post to MB)
function createImposterManager(config = {}, opts = {}) {
  return new ImposterManager(config, opts)
}

class ImposterManager extends Logger {
  constructor(config = {}, opts) {
    super('ImposterManager', opts || config)
    this.config = config || {}
    this.configDefaults(this.config.defaults)
    this.routes = new Set()
  }

  clearRoutes() {
    this.routes.clear()
  }

  configDefaults(config) {
    if (isObject(config)) {
      this._defaults = config
    }
  }

  get autoCreate() {
    return this.config.autoCreate || this.defaults.autoCreate
  }

  get response() {
    return this._response = this._response || new Response(this.imposter)
  }

  get defaults() {
    return this._defaults || {
      server: {},
      config: {
        'imposterPort': 3000
      }
    }
  }

  start(opts = {}) {
    const port = opts.port || (this.defaults.server || {}).port || 2525
    // start the MB server  and post our Imposter to listen!
    mbHelper.startMbServer(port)
      .then(() => {
        imposterManager.postToMountebank()
          .then(() => {
            console.log('Imposter Ready: http://localhost:3000');
            console.log('routes', this.routes)
          });
      });
  }

  _validateObj(obj, msg) {
    if (!isObject(obj)) {
      this.error(msg, {
        obj
      })
    }
  }

  addRoutes(responses) {
    try {
      if (isObject(responses)) {
        this._log('add routes k/v', {
          routes: responses
        })
        // use each key as default name
        Object.keys(responses).map(key => {
          let route = responses[key]
          this.addRoute(route, key)
        })
        return
      }

      responses = toArray(responses)
      this._log('add routes list', {
        routes: responses
      })
      responses.map(response => this.addRoute(response))
    } catch (err) {
      this.error('addRoutes: invalid responses', {
        responses
      })
    }
    return this
  }

  addRoute(route, name) {
    this._validateObj(route, 'addRoute: response')
    if (!this.imposter) {
      if (this.autoCreate) {
        this.create()
      }
      if (!this.imposter) {
        this._error('You need to first create the Imposter server')
        return
      }
    }
    this.imposter.addRoute(route)
    let defaultName = 'unknown' + (this.routes.size || this.routes.length)
    let routeName = route.name || name || this._routeName(route) || defaultName
    this.routes.add(routeName)
    this._log('Added route', {
      routeName,
      route
    })
    this.lastRouteName = routeName
    return this
  }

  _routeName(route) {
    return route.name || [route.verb, route.uri].join(':')
  }

  postToMountebank() {
    this.imposter.postToMountebank()
  }

  create(config = {}) {
    let fullConfig = Object.assign({}, this.defaults.config || {}, this.config || {}, config)
    this.imposter = new mbHelper.Imposter(fullConfig)
    return this
  }
}

module.exports = {
  createImposterManager,
  ImposterManager
}
