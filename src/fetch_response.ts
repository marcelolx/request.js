export class FetchResponse {
  response: Response
  
  constructor (response: Response) {
    this.response = response
  }

  get statusCode () {
    return this.response.status
  }

  get ok () {
    return this.response.ok
  }

  get unauthenticated () {
    return this.statusCode === 401
  }

  get authenticationURL () {
    return this.response.headers.get('WWW-Authenticate')
  }

  get contentType () {
    const contentType = this.response.headers.get('Content-Type') || ''

    return contentType.replace(/;.*$/, '')
  }

  get headers () {
    return this.response.headers
  }

  get html () {
    if (this.contentType.match(/^(application|text)\/(html|xhtml\+xml)$/)) {
      return this.response.text()
    }

    return Promise.reject(new Error(`Expected an HTML response but got "${this.contentType}" instead`))
  }

  get json () {
    if (this.contentType.match(/^application\/json/)) {
      return this.response.json()
    }

    return Promise.reject(new Error(`Expected a JSON response but got "${this.contentType}" instead`))
  }

  get text () {
    return this.response.text()
  }

  get isTurboStream () {
    return this.contentType.match(/^text\/vnd\.turbo-stream\.html/)
  }

  async renderTurboStream () {
    if (this.isTurboStream) {
      if (window.Turbo) {
        window.Turbo.renderStreamMessage(await this.text)
      } else {
        console.warn('You must set `window.Turbo = Turbo` to automatically process Turbo Stream events with request.js')
      }
    }

    return Promise.reject(new Error(`Expected a Turbo Stream response but got "${this.contentType}" instead`))
  }
}
