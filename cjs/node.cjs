const getExport = name => import("../dist/node.mjs").then(r => r[name]);
const createCaller = name => (input, init) => getExport(name).then(function_ => function_(input, init));

exports.fetch = createCaller("fetch");
exports.ofetch = createCaller("ofetch");
exports.$fetch = createCaller("$fetch");
exports.$fetch.raw = (input, init) => getExport("$fetch").then($fetch => $fetch.raw(input, init));
exports.$fetch.native = (input, init) => getExport("$fetch").then($fetch => $fetch.native(input, init));
