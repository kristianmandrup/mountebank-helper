<h1> MountebankHelper </h1>

[![Build Status](https://travis-ci.org/Tzinov15/mountebank-helper.svg?branch=master)](https://travis-ci.org/Tzinov15/mountebank-helper)
[![Coverage Status](https://coveralls.io/repos/github/Tzinov15/mountebank-helper/badge.svg?branch=master&bust=1)](https://coveralls.io/github/Tzinov15/mountebank-helper?branch=master)

A simple Javascript wrapper to easily interface with <a href = 'http://www.mbtest.org/'>Mountebank</a> and not have to deal with its
abstract object structure requirements. See **[SwaggerBank](https://tzinov15.github.io/swagger-bank/)** for easy intergration with Swagger Specs/YAML files <br><br>

While not providing an API for the full feature list that mountebank has, MountebankHelper provides enough functionality so that it reflects the core purpose of Mountebank and is easy to use at the same time. <br>

In the future this library will probably become a full-fledged Javascript wrapper around several of Mountebanks powerful CLI commands

<h1> Usage </h1>


```javascript

// import the mountebank helper library
const mbHelper = require('mountebank-helper');

// create the skeleton for the imposter (does not post to MB)
const firstImposter = new mbHelper.Imposter({ 'imposterPort' : 3000 });

// construct sample responses and conditions on which to send it
const sample_response = {
  'uri' : '/hello',
  'verb' : 'GET',
  'res' : {
    'statusCode': 200,
    'responseHeaders' : { 'Content-Type' : 'application/json' },
    'responseBody' : JSON.stringify({ 'hello' : 'world' })
  }
};

const another_response = {
  'uri' : '/pets/123',
  'verb' : 'PUT',
  'res' : {
    'statusCode': 200,
    'responseHeaders' : { 'Content-Type' : 'application/json' },
    'responseBody' : JSON.stringify({ 'somePetAttribute' : 'somePetValue' })
  },
  predicates: [{
    deepEquals: {
      'body': 'Hello'
    }
  }, {
    // ...
  }]
};

// add our responses to our imposter
firstImposter.addRoute(sample_response);
firstImposter.addRoute(another_response);

// start the MB server  and post our Imposter to listen!
mbHelper.startMbServer(2525)
.then(function() {
  firstImposter.postToMountebank()
  .then( () => {
  console.log('Imposter Posted! Go to http://localhost:3000/hello');
  });
});
```

Now you can navigate to <a href = 'http://localhost:3000/hello'>localhost:3000/hello</a> to see the mocked response!

<h3>Proxy & Inject </h3>

In order to use `proxy` or `inject` responses, simply provide the response in the full response format as expected by Mountebank.

See [httpbin](https://httpbin.org) for various ways you can test a proxy.

```js
{
  proxy: {
    mode: 'proxyOnce',
    to: 'https://httpbin.org/status/200'
  }
}
```

This appraoch can also be used for `is` if you want full control or want to directly reuse existing responses in the "traditional" format

```js
{
  "is": {
    "statusCode": 201,
    "headers": {
      "Location": "http://localhost:4545/customers/123",
      "Content-Type": "application/xml"
    },
    "body": "<customer><email>customer@test.com</email></customer>"
  }
}
```

See the tests under `test/mb_post` to see usage examples. Note `inject` have not yet been tested...

<h3>Logging</h3>

Both the `Imposter` and `ImposterManager` class can be passed a `logging` flag to enable logging (ie. `logging: true`)

You can then use the following log methods for debugging:

- `this._log(msg, data)`
- `this._warn(msg, data)`
- `this._error(msg, data)`

This can be very useful when you extend the base class and then `log` before using `super` to call the subclass method.

```js
class MyImposter extends Imposter {
  constructor(options) {
    super(options)
    // custom setup logic...
  }

  _createMBPostRequestBody() {
    this.log('_createMBPostRequestBody')
    super._createMBPostRequestBody()
  }

  addRoute(routeOptions) {
    this.log('addRoute', {
      routeOptions
    })
    super.addRoute(routeOptions)
  }
}
```

<h3>Testing</h3>

Test are written in mocha/chai

Run all tests:

```bash
$ npm test
```

Run a single file test suite:

```bash
$ ./node_modules/mocha/bin/mocha test/custom_response_type.test.js
```



<h1>ImposterManager</h1>

Additionally an `ImposterManager` is made available which makes it a little more convenient to work with the `Imposter`.

First define a list of responses and export as a collection, such as an
`Object` (key/value). By default the key will be used as route name unless you add a `name` property to a given response.

If you pass a list (`Array`) of responses, it will fallback to concatenating `verb` and `uri` so that the `update` response would be named: `PUT:/pets/123`

```js
const update = {
  'uri': '/pets/123',
  'verb': 'PUT',
  'res': {
    // ...
  }
}

const create = {
  'uri': '/pets/123',
  'verb': 'POST',
  'res': {
    // ...
  }
}

export default {
  update,
  create
}
```

Now add `responses` as routes and start the server using the manager.

```js
import responses from './responses'

const { createImposterManager } = require('mountebank-helper/manager');
const imposterManager = createImposterManager().addRoutes(responses)
imposterManager.start()
```

You also have access to a `response` object with a fluent API that can be used to update a given response:

- `updateCode` (or `updateStatus`)
- `updateHeaders` (object)
- `updateBody` (string)

Example, updating the body of a previous response (stub)

```js
imposterManager.response
  .updateBody(body, path)
  .updateCode(201, path)
```

Please see the `manager` test suite for more detailed usage examples.

<h1>API</h1>

<h3>MountebankHelper.startMbServer(port)</h3>
<h5> port </h5> The port on which the main Mountebank server is to listen on
This will start up the main Mountebank server and have it start listening for imposter create/update requests. This must be called before making any postToMountebank or updateResponse calls

<h3>MountebankHelper.Imposter(port, protocol)</h3>
Constructor for the Imposter class which serves as the main entry point for interacting with Mountebank. <br>
A single instance of an Imposter class represents a single Mountebank imposter listening on a single port. <br>
<h5> port </h5> The port on which the Imposter is to listen on for incoming traffic
<h5> protocol </h5> The protocol the Imposter is to run on

<h3>Imposter.addRoute(responseObject)</h3>
Adds a new <b> stub </b> to the imposter. A stub represents a combination of a predicate (conditions to be met) and a response (the response to be returned when those conditions are met). <br>

If no predicates are provided, a default<b>equals</b> predicate (matching on verb and path) is added. See more on usage at end of README

<h5> responseObject </h5>

```javascript
{
  "uri" :  some_uri,      // URI against which we are matching an incoming request
  "verb" : GET,           // HTTP method against which we are matching an incoming request
  "res" :                 // The response that is to be returned when the above conditions get met
    {
      "statusCode" : 200,
      "responseHeaders" : {"Content-Type" : "application/json"},
      "responseBody" : JSON.stringify({"hello" : "world"})
    }
}
```

<h3>Imposter.postToMountebank()</h3>
Makes the actual POST request to the instance of mountebank running on localhost:2525 in order to setup the listening Imposter. Returns a Promise that resolves to the response returned from the Mountebank server

<h3>Imposter.updateResponseBody(newBody, pathToUpdate)</h3>
<h5>newBody</h5>
The content of the new body that is to be returned by the imposter. Must be a string
<h5>pathToUpdate</h5>
```javascript
{
  "uri" :  some_uri,      // URI of the response you wish to update
  "verb" : GET           // HTTP Method of the response you wish to update
}
```

<h3>Imposter.updateResponseCode(newCode, pathToUpdate)</h3>
<h5>newCode</h5>
The new status code that is to be returned by the imposter. Must be a string
<h5>pathToUpdate</h5>
```javascript
{
  "uri" :  some_uri,      // URI of the response you wish to update
  "verb" : GET           // HTTP Method of the response you wish to update
}
```

<h3>Imposter.updateResponseHeaders(newHeaders, pathToUpdate)</h3>
<h5>newHeaders</h5>
The content of the new headers that is to be returned by the imposter. Must be a string
<h5>pathToUpdate</h5>
```javascript
{
  "uri" :  some_uri,      // URI of the response you wish to update
  "verb" : GET           // HTTP Method of the response you wish to update
}
```

<h2>Using the stubbed API in your application test suite</h2>

Assuming Mountebank has been started on the default port `3000`.
Simply make requests to the API at `localhost:3000` (or whatever your host may be).

You can use assertion/expectation frameworks such as:

### Super

[supertest](https://www.npmjs.com/package/supertest) HTTP assertions via [superagent](https://github.com/visionmedia/superagent)

Use [superagent-promise](https://www.npmjs.com/package/superagent-promise) for Promise support:

```js
var Promise = this.Promise || require('promise');
var agent = require('superagent-promise')(require('superagent'), Promise);

agent
  .get('localhost:3000/products')
  .query({ action: 'edit', city: 'London' })
  .end()
  .then(onResult(res) => {
    // test result
  }, onError(err) {
    // test err
  });
```

Alternatively use `async`/`await`, here using [ava test runner](https://github.com/avajs/ava)

```js
import test from 'ava'
test('products', async t => {
  try {
    result = await agent
      .get('localhost:3000/products')
      .query({ action: 'edit', city: 'London' })
      .end()
    // test result
  } catch (err) {
    // test err
  }
})
```

### Nock

[nock](https://www.npmjs.com/package/nock) HTTP mocking and expectations

```js
var scope = nock('localhost:3000')
   .post('/products', products)
   .reply(201, function(uri, requestBody) {
     return requestBody;
   });
```

You can [enable/disable real HTTP requests](https://github.com/node-nock/nock#enabledisable-real-http-request) (to the Mountebank server) as needed.

`nock.enableNetConnect()`

You can also use the [recording](https://github.com/node-nock/nock#recording) feature to record Mountebank generated responses as nock mocks!

```js
nock.recorder.rec({
  dont_print: true,
  output_objects: true,
  enable_reqheaders_recording: true
})
```

At the end you can then completely [turn off nock](https://github.com/node-nock/nock#turning-nock-off-experimental) when you full API has been implemented on the backend!

`$ NOCK_OFF=true node my_test.js`

Nock has loads of other powerful options, including:

- [fixture recording](https://github.com/node-nock/nock#nock-back)

### Chai

[chai-http](https://github.com/chaijs/chai-http) (chai HTTP assertions)

```js
const chai = require('chai')
  , chaiHttp = require('chai-http');
  . app = 'localhost:3000'

chai.use(chaiHttp);

chai.request(app)
  .get('/')

chai.request(app)
  .put('/user/me')
  .set('X-API-Key', 'foobar')
  .send({ password: '123', confirmPassword: '123' })
  .end(function (err, res) {
     expect(res).to.have.status(200);
     // ...
  })
```

Also supports a `Promise` API:

```js
chai.request(app)
  .put('/user/me')
  .send({ password: '123', confirmPassword: '123' })
  .then(function (res) {
     expect(res).to.have.status(200);
  })
  .catch(function (err) {
     throw err;
  })
```

### Swagger

Check out [swagger-bank](https://tzinov15.github.io/swagger-bank/) for Swagger integration.

```js
const SwaggerBank = require('swaggerbank');
const api = new SwaggerBank.API('./demoApi.yaml');

api.validateAPI()
.then( () => {
  api.setupMountebankImposter(3000);
})
```

Behind the scenes, it creates responses in the form expected by `mountebank-helper` using random data that reflect the Swagger schema definitions in the yaml file.

```js
function constructCompleteResponse (options) {
  const finalResponse = {
    'uri': options.uri,
    'verb': options.method,
    'res': {
      'statusCode': options.statusCode,
      'responseHeaders': { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      'responseBody': JSON.stringify(options.populatedTemplate)
    }
  };

  return finalResponse;
}
```

Sample Swagger `.yaml` file:

```yaml
swagger: '2.0'
info:
  title: Hiking Guide
  description: Get the best out of your hiking guides
  version: 1.0.0
  contact:
    name: Alex Tzinov,
    url: http://www.hiking-guides.com,
    email: some_email@gmail.com
host: api.hiking-guides.com
schemes:
- https
basePath: "/v1"
produces:
- application/json
```

Responses

```yaml
responses:
  Area:
    description: An area object
    schema:
      type: object
      "$ref": "#/definitions/area"
    examples:
      application/json:
        area_id: f2552036-3ef9-11e6-beb8-9e71128cae77
        name: some_random_area_name
        tag: radar
        description: some random string for area description
        trails:
        - trail_id: 590481d2-3efa-11e6-beb8-9e71128cae77
          name: some_random_trail_name
          description: some random string for trail description
          distance: 134
          rating: 1
```

Paths

```yaml
paths:
  "/areas":
    get:
      description: This areas endpoint returns information about all of the areas available
      summary: Get all of the areas in the hiking guide
      tags:
      - areas
      responses:
        '200':
          "$ref": "#/responses/AreaArray"
        default:
          description: unexpected error
          schema:
            "$ref": "#/definitions/error"
    post:
      description: This areas endpoint supports the creation of new areas by supplying all the required information of the area in the body
      summary: Add a new area to the hiking guide
      parameters:
      - name: body
        description: The area object that is to be added to the hiking guide
        in: body
        required: true
        schema:
          "$ref": "#/definitions/area"
      tags:
      - areas
      responses:
        '201':
          "$ref": "#/responses/Area"
        default:
          description: unexpected error
          schema:
            "$ref": "#/definitions/error"
  "/areas/{area_id}":
    get:
      description: 'Retrieves a single area object containing information about that
        area, referenced by area_id'
      parameters:
      - name: area_id
        in: path
        type: string
        format: uuid
        required: true
        description: the unique uuid that identifies this area
      summary: Get an area by area ID
      tags:
      - areas
      responses:
        '200':
          "$ref": "#/responses/Area"
        default:
          description: unexpected error
          schema:
            "$ref": "#/definitions/error"
```

And so on...
