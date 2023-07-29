var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/handler.ts
var handler_exports = {};
__export(handler_exports, {
  hello: () => hello
});
module.exports = __toCommonJS(handler_exports);

// ../core/src/lib/core.ts
function coreFunction() {
  return "core";
}

// src/handler.ts
var hello = async () => {
  const test = coreFunction();
  console.log("Go Serverless Webpack (Typescript) v1.0! Your function executed successfully!" + test);
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  hello
});
