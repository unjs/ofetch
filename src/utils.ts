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
  return val.constructor?.name === 'Object' || typeof val.toJSON === 'function'
}

const textTypes = new Set([
  'image/svg',
  'application/xml',
  'application/xhtml',
  'application/html'
])

const jsonTypes = new Set(['application/json', 'application/ld+json'])

// This provides reasonable defaults for the correct parser based on Content-Type header.
export function detectContentMethod (_contentType = ''): 'text' | 'blob' | 'json' | 'arrayBuffer' {
  if (!_contentType) {
    return 'json'
  }

  // Value might look like: `application/json; charset=utf-8`
  const contentType = _contentType.split(';').shift()!

  if (jsonTypes.has(contentType)) {
    return 'json'
  }

  if (textTypes.has(contentType) || contentType.startsWith('text/')) {
    return 'text'
  }

  return 'blob'
}
