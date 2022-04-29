const payloadMethods = new Set(Object.freeze(['PATCH', 'POST', 'PUT', 'DELETE']))
export function isPayloadMethod (method: string = 'GET') {
  return payloadMethods.has(method.toUpperCase())
}

export function isJSONSerializable (val: any) {
  if (val === undefined) {
    return false
  }
  const t = typeof val
  if (t === 'string' || t === 'number' || t === 'boolean' || t === null) {
    return true
  }
  if (t !== 'object') {
    return false // bigint, function, symbol, undefined
  }
  if (Array.isArray(val)) {
    return true
  }
  return (val.constructor && val.constructor.name === 'Object') ||
   typeof val.toJSON === 'function'
}

const textTypes = new Set([
  'image/svg',
  'application/xml',
  'application/xhtml',
  'application/html'
])

const JSON_RE = /^application\/(?:[\w!#$%&*`\-.^~]*\+)?json(;.+)?$/i

interface ResponseMap {
  blob: Blob
  text: string
  arrayBuffer: ArrayBuffer
}

export type ResponseType = keyof ResponseMap | 'json'
export type MappedType<R extends ResponseType, JsonType = any> = R extends keyof ResponseMap ? ResponseMap[R] : JsonType

// This provides reasonable defaults for the correct parser based on Content-Type header.
export function detectResponseType (_contentType = ''): ResponseType {
  if (!_contentType) {
    return 'json'
  }

  // Value might look like: `application/json; charset=utf-8`
  const contentType = _contentType.split(';').shift()!

  if (JSON_RE.test(contentType)) {
    return 'json'
  }

  if (textTypes.has(contentType) || contentType.startsWith('text/')) {
    return 'text'
  }

  return 'blob'
}
