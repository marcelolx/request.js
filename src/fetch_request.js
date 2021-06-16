import { FetchResponse } from './fetch_response'
import { RequestInterceptor } from './request_interceptor'
import { getCookie, compact, metaContent } from './lib/utils'

export class FetchRequest {
  constructor (method, url, options = {}) {
    this.method = method
    this.url = url
    this.options = options
  }

  async perform () {
    try {
      const requestInterceptor = RequestInterceptor.get()
      if (requestInterceptor) {
        await requestInterceptor(this)
      }
    } catch (error) {
      console.error(error)
    }
    const response = new FetchResponse(await window.fetch(this.url, this.fetchOptions))

    if (response.unauthenticated && response.authenticationURL) {
      return Promise.reject(window.location.href = response.authenticationURL)
    }

    if (response.ok && response.isTurboStream) { 
      response.renderTurboStream()
    }

    return response
  }

  addHeader (key, value) {
    const headers = this.additionalHeaders
    headers[key] = value
    this.options.headers = headers
  }

  get fetchOptions () {
    const requestOptions = {
      method: this.method.toUpperCase(),
      headers: this.headers,
      body: this.body,
      signal: this.signal,
      credentials: 'same-origin',
      redirect: 'follow'
    }

    this._stringifyBody(requestOptions)

    return requestOptions
  }

  get headers () {
    return compact(
      Object.assign({
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRF-Token': this.csrfToken,
        'Content-Type': this.contentType,
        Accept: this.accept
      },
      this.additionalHeaders)
    )
  }

  get csrfToken () {
    return getCookie(metaContent('csrf-param')) || metaContent('csrf-token')
  }

  get contentType () {
    if (this.options.contentType) {
      return this.options.contentType
    } else if (this.body == null || this.body instanceof window.FormData) {
      return undefined
    } else if (this.body instanceof window.File) {
      return this.body.type
    }

    return 'application/json'
  }

  get accept () {
    switch (this.responseKind) {
      case 'html':
        return 'text/html, application/xhtml+xml'
      case 'turbo-stream':
        return 'text/vnd.turbo-stream.html, text/html, application/xhtml+xml'
      case 'json':
        return 'application/json'
      default:
        return '*/*'
    }
  }

  get body () {
    return this.options.body
  }

  get responseKind () {
    return this.options.responseKind || 'html'
  }

  get signal () {
    return this.options.signal
  }

  get additionalHeaders () {
    return this.options.headers || {}
  }

  _stringifyBody (requestOptions) {
    const bodyIsAString = Object.prototype.toString.call(requestOptions.body) === '[object String]'
    const contentTypeIsJson = requestOptions.headers['Content-Type'] === 'application/json'
    
    if (contentTypeIsJson && !bodyIsAString) {
      requestOptions.body = JSON.stringify(requestOptions.body)
    }
  }
}
