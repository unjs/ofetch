const getExport = name => import("../dist/node.mjs").then(r => r[name]);
const createCaller = name => (input, init) => getExport(name).then(function_ => function_(input, init));

exports.fetch = createCaller("fetch");

exports.ofetch = createCaller("ofetch");
exports.ofetch.create = defaultOptions => getExport("ofetch").then($fetch => $fetch.create(defaultOptions));
exports.ofetch.raw = (input, init) => getExport("ofetch").then($fetch => $fetch.raw(input, init));
exports.ofetch.native = (input, init) => getExport("ofetch").then($fetch => $fetch.native(input, init));

exports.$fetch = createCaller("$fetch");
exports.$fetch.create = defaultOptions => getExport("$fetch").then($fetch => $fetch.create(defaultOptions));
exports.$fetch.raw = (input, init) => getExport("$fetch").then($fetch => $fetch.raw(input, init));
exports.$fetch.native = (input, init) => getExport("$fetch").then($fetch => $fetch.native(input, init));
