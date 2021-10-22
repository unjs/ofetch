exports.$fetch = (...args) => import('../dist/index.mjs')
  .then(r => r.$fetch)
  .then($fetch => $fetch(...args))
