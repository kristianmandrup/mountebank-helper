module.exports = class Response {
  constructor(imposter) {
    this.imposter = imposter
  }

  updateBody(newBody, pathToUpdate) {
    this.imposter.updateResponseBody(newBody, pathToUpdate)
    return this
  }

  updateCode(newCode, pathToUpdate) {
    this.imposter.updateResponseCode(newCode, pathToUpdate)
    return this
  }

  updateHeaders(newHeaders, pathToUpdate) {
    this.imposter.updateResponseHeaders(newHeaders, pathToUpdate)
    return this
  }
}
