module.exports = class Logger {
  constructor(name, options) {
    this.clazzName = name
    this.logging = options.logging
    this.io = options.io || console
  }

  _writeMsg(io, msg, data) {
    msg = `[${this.clazzName}] ${msg}`
    data ? io(msg, data) : io(msg)
  }

  _log(msg, data) {
    if (this.logging) {
      let io = this.io.log
      this._writeMsg(io, `INFO: ${msg}`, data)
    }
  }

  _warn(msg, data) {
    if (this.logging) {
      let io = this.io.log
      this._writeMsg(io, `WARNING: ${msg}`, data)
    }
  }

  _error(msg, data) {
    if (this.logging) {
      let io = this.io.error || this.io.log
      this._writeMsg(io, `ERROR: ${msg}`, data)
      throw new Error(msg)
    }
  }
}
