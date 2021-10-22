exports.$fetch = (...args) => import('../dist/node.mjs')
  .then(r => r.$fetch)
  .then($fetch => $fetch(...args))
