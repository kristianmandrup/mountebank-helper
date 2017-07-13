export class Response {
  constructor(imposter) {
    this.imposter = imposter
  }

  updateBody(newBody, pathToUpdate) {
    this.imposter.updateResponseBody(newBody, pathToUpdate)
  }

  updateCode(newCode, pathToUpdate) {
    this.imposter.updateResponseCode(newCode, pathToUpdate)
  }

  updateHeaders(newHeaders, pathToUpdate) {
    this.imposter.updateResponseHeaders(newHeaders, pathToUpdate)
  }
}
