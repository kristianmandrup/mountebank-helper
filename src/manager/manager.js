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
    this._validateObj(responses, 'addRoutes: responses')
    try {
      this.routes = Object.keys(responses)
      responses = toArray(responses)
      responses.map(response => this.addRoute(response))
    } catch (err) {
      this.error('addRoutes: invalid responses', {
        responses
      })
    }
    return this
  }

  addRoute(response) {
    this._validateObj(response, 'addRoute: response')
    this.imposter.addRoute(response)
  }

  postToMountebank() {
    this.imposter.postToMountebank()
  }

  create(config = {}) {
    config = Object.assign({}, this.defaults.config, config)
    return this.imposter = new mbHelper.Imposter(config)
  }
}
