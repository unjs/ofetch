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
