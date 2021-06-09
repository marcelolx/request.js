import { FetchRequest } from "./fetch_request"

interface Interceptor {
  (request: FetchRequest): Promise<void>
}

export class RequestInterceptor {
  static interceptor: Interceptor | undefined

  static register (interceptor: Interceptor) {
    this.interceptor = interceptor
  }

  static get () {
    return this.interceptor
  }

  static reset () {
    this.interceptor = undefined
  }
}
