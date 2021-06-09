import { FetchResponse } from './fetch_response'
import { getCookie } from './lib/cookie'
import { RequestInterceptor } from './request_interceptor'

export enum FetchResponseKind {
  html,
  turboStream,
  json,
  any
}

export interface FetchRequestInit extends RequestInit {
  /**
   * A string indicating the request Content-Type
   */
  contentType?: string

  /**
   * A enum indicating the response kind that the request accepts
   */
  responseKind?: FetchResponseKind | string
}

export class FetchRequest {
  method!: string
  url!: string
  options: FetchRequestInit

  constructor (method: string, url: string, options: FetchRequestInit = {}) {
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

  addHeader (key: string, value: string) {    
    const headers = this.additionalHeaders
    headers.set(key, value)
    this.options.headers = headers
  }

  get fetchOptions (): RequestInit {
    return {
      method: this.method.toUpperCase(),
      headers: this.headers,
      body: this.body,
      signal: this.signal,
      credentials: 'same-origin',
      redirect: 'follow'
    }
  }

  get headers () {
    return compact({ ...this.defaultHeaders, ...this.additionalHeaders })
  }

  get defaultHeaders (): HeadersInit {
    return {
      'X-Requested-With': 'XMLHttpRequest',
      'X-CSRF-Token': this.csrfToken,
      'Content-Type': this.contentType,
      'Accept': this.accept
    }
  }

  get csrfToken (): string {
    return getCookie(metaContent('csrf-param')) || metaContent('csrf-token') || ''
  }

  get contentType (): string {
    if (this.options.contentType) {
      return this.options.contentType
    } else if (this.body == null || this.body instanceof window.FormData) {
      return ''
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

  get additionalHeaders (): Headers {
    return new Headers(this.options.headers || {})
  }
}

function compact (object: Headers) {
  const result = new Headers()

  for (const [key, value] of object) {
    if ((value !== undefined) || (value !== '')) {
      result.set(key, value)
    }
  }

  return result
}

function metaContent (name: string) {
  const element: HTMLMetaElement | null = document.head.querySelector(`meta[name="${name}"]`)
  return element && element.content
}
