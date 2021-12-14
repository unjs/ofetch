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

// This provides reasonable defaults for the correct parser based on Content-Type header
export function detectContentMethod (contentType = ''): 'text' | 'blob' {
  // Value might look like: `application/json; charset=utf-8`
  switch (true) {
    case !contentType:
    case contentType.startsWith('text/'):
    case contentType.startsWith('image/svg'):
    case contentType.startsWith('application/xml'):
    case contentType.startsWith('application/xhtml'):
    case contentType.startsWith('application/html'):
    case contentType.startsWith('application/json'):
    case contentType.startsWith('application/ld+json'):
      return 'text'

    default:
      return 'blob'
  }
}
