const getExport = name => import('../dist/node.mjs').then(r => r[name])
const createCaller = name => (...args) => getExport(name).then(fn => fn(...args))

exports.fetch = createCaller('fetch')
exports.$fetch = createCaller('$fetch')
exports.$fetch.raw = (...args) => getExport('$fetch').then($fetch => $fetch.raw(...args))
