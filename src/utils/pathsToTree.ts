import * as path from "path";

type Directory = {
  name: string;
  children: object[];
};

type PathToTreeOptions = {
  splitPaths: (path: string) => string[];
  parseFile: (path: string) => any[];
  createDirectory: <T>(directory: Directory) => Partial<T | Directory>;
};

const defaults: PathToTreeOptions = {
  splitPaths: (x: string) => x.split("/"),
  parseFile: (x: string) => [{ path: x }],
  createDirectory: (obj) => obj,
};

export const pathsToTree = (
  filePaths: string[],
  {
    splitPaths = defaults.splitPaths,
    parseFile = defaults.parseFile,
    createDirectory = defaults.createDirectory,
  }: Partial<PathToTreeOptions> = defaults
) => {
  // This was stolen from StackOverflow and converts filePath arrays to fileTree like objects.
  // It wasn't written with ts in mind, so pls ignore the gross types.
  let result: any = [];
  let level = { result };
  filePaths.forEach((filePath: string) => {
    splitPaths(filePath).reduce((r: any, name) => {
      if (!r[name]) {
        r[name] = { result: [] };
        if (name === path.basename(filePath)) {
          parseFile(filePath).forEach((x: object) => {
            r.result.push(x);
          });
        } else {
          r.result.push(createDirectory({ name, children: r[name].result }));
        }
      }
      return r[name];
    }, level);
  });
  return result;
};
