exports.routes = {
  custom: {
    uri: '/custom',
    verb: 'GET',
    res: {
      proxy: {
        mode: 'proxyOnce',
        to: 'https://httpbin.org/status/200'
      }
    }
  },
  named: {
    name: 'my-named-route',
    uri: '/named',
    verb: 'GET',
    res: {
      'statusCode': 200,
      'responseHeaders': {
        'Content-Type': 'application/json'
      },
      'responseBody': JSON.stringify({
        'somePetAttribute': 'somePetValue'
      })
    }
  }
}
