/**
 * Runs the compiled data checks.
 *
 * TypeScript understands the "@/..." alias but does not rewrite it on the way
 * out, so this teaches Node the same mapping before loading the checks.
 */
const path = require("path");
const Module = require("module");

const compiled = path.join(__dirname, "..", ".verify");
const resolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...rest) {
  return resolve.call(
    this,
    request.startsWith("@/") ? path.join(compiled, request.slice(2)) : request,
    ...rest,
  );
};

require(path.join(compiled, "scripts", "verify-data.js"));
