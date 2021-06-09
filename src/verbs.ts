import { FetchRequest } from './fetch_request'

async function get (url: string, options: RequestInit = {}) {
  const response = new FetchRequest('get', url, options)
  return response.perform()
}

async function post (url: string, options: RequestInit = {}) {
  const response = new FetchRequest('post', url, options)
  return response.perform()
}

async function put (url: string, options: RequestInit = {}) {
  const response = new FetchRequest('put', url, options)
  return response.perform()
}

async function patch (url: string, options: RequestInit = {}) {
  const response = new FetchRequest('patch', url, options)
  return response.perform()
}

async function destroy (url: string, options: RequestInit = {}) {
  const response = new FetchRequest('delete', url, options)
  return response.perform()
}

export { get, post, put, patch, destroy }
