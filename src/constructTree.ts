import * as fs from "fs";
import * as path from "path";

const ignore = [".git", "node_modules", "dist"];

export const constructTree = (root: string): any => {
  return fs.readdirSync(root).map((x) => {
    const file = path.join(root, x);
    if (ignore.includes(file)) return null;
    if (fs.lstatSync(file).isDirectory()) {
      return { path: file, id: x, children: constructTree(path.join(root, x)) };
    }
    return { path: file, id: x };
  });
};
