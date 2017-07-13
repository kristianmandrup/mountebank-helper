import mbHelper from 'mountebank-helper'
import {
  Response
} from './response'
import {
  toArray,
  isObject
} from './helpers'

function merge(...objs) {
  return Object.assign({}, ...objs)
}

// create the skeleton for the imposter (does not post to MB)
export function createImposterManager(config = {}) {
  config = merge(defaults.config, config)
  return new mbHelper.Imposter(config)
}

export class ImposterManager {
  constructor(config, opts) {
    super('ImposterManager', opts)
    this._defaults = config.defaults
    this.routes = new Set()
  }

  clearRoutes() {
    this.routes.clear()
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
    if (!isObject(responses)) {
      this.error(msg, {
        obj
      })
    }
  }

  addRoutes(responses) {
    try {
      responses = toArray(responses)
      responses.map(response => this.addRoute(response))
    } catch (err) {
      this.error('addRoutes: invalid responses', {
        responses
      })
    }
    return this
  }

  addRoute(route) {
    this._validateObj(route, 'addRoute: response')
    this.imposter.addRoute(route)
    this.routes.add(this._routeName(route) || 'unknown')
  }

  _routeName(route) {
    return route.name || [route.uri, route.verb].join(',')
  }

  postToMountebank() {
    this.imposter.postToMountebank()
  }

  create(config = {}) {
    config = Object.assign({}, this.defaults.config, config)
    return this.imposter = new mbHelper.Imposter(config)
  }
}
