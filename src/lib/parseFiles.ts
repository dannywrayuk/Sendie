import * as YAML from "yaml";
import * as ts from "typescript";

const parse = async (source: string) => {
  if (!source) return;
  try {
    return JSON.parse(source);
  } catch (e) {}

  try {
    return YAML.parse(source);
  } catch (e) {}

  try {
    const jsSource = ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.CommonJS },
    }).outputText;
    const AsyncFunction = async function () {}.constructor;
    // @ts-ignore
    const f = new AsyncFunction(
      "require",
      "exports",
      jsSource + ";return exports.default;"
    );
    return await f(
      (module: string) => {
        try {
          return eval(`require("${module}")`);
        } catch (e) {}
        throw new Error("Cannot find module: " + module);
      },
      {
        default: undefined,
      }
    );
  } catch (e) {
    console.log(e);
  }

  return;
};

export const parseSendieDocument = parse;

export const parseSendieContext = parse;
