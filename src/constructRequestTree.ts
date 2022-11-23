import * as fs from "fs";
import * as path from "path";
import * as glob from "glob";
import * as vscode from "vscode";

const ignore = ["node_modules/**", "dist/**"];

const findRequestFiles = (root: string = "") => {
  return glob
    .sync(path.join(root, "**/*.sendie.{js,json}"), { ignore })
    .map((file) => path.relative(root, file));
};

const constructRequest = ({ data, path, index }: any): any => {
  return {
    label: data.name,
    path,
    index,
    iconPath: new vscode.ThemeIcon("mail"),
  };
};

const constructCollection = ({ data, path, index }: any): any => {
  return {
    label: data.name,
    path,
    index,
    collapsibleState: true,
    contextValue: "folder",
    children: constructItem({ data: data.children, path }),
  };
};

const constructItem = ({ data, index, path }: any): any[] => {
  if (Array.isArray(data)) {
    return data.map((x, index) => constructItem({ data: x, index, path }));
  }

  switch (data.type) {
    case "request":
      return constructRequest({ data, path });
    case "collection":
      return constructCollection({ data, path });
    default:
      console.log("Unknown Type");
      return [];
  }
};

const parseRequestFile = (requestFile: any): any => {
  const data = fs.readFileSync(requestFile).toString();
  if (path.extname(requestFile) === ".json") {
    const parsedData = JSON.parse(data);
    return constructItem({ data: parsedData, path: requestFile });
  }
};

const splitDirectory = (dir: string) => {
  const dirArray = dir.split(path.sep);
  if (dirArray[0] === "sendie") {
    return dirArray.slice(1);
  }
  if (dirArray.length > 2) {
    return dirArray.slice(-2);
  }
  return dirArray;
};

const sortResults = (results: any[]) => {
  results.forEach(
    (result: any) => result?.children && sortResults(result.children)
  );
  results.sort((a, b) => {
    if (a.children && !b.children) return -1;
    if (!a.children && b.children) return 1;
    return a.label - b.label;
  });
  return results;
};

export const constructRequestTree = (root: string): any => {
  let result: any = [];
  let level = { result };
  const requestFiles = findRequestFiles(root);
  console.log(requestFiles);

  requestFiles.forEach((dir: any) => {
    splitDirectory(dir).reduce((r: any, name: any) => {
      if (!r[name]) {
        r[name] = { result: [] };
        if (name === path.basename(dir)) {
          const parsedRequests = parseRequestFile(path.join(root, dir));
          if (Array.isArray(parsedRequests)) {
            parsedRequests.forEach((x: any): any => {
              r.result.push(x);
            });
          } else {
            r.result.push(parsedRequests);
          }
        } else {
          r.result.push({
            label: name,
            collapsibleState: true,
            contextValue: "folder",
            children: r[name].result,
          });
        }
      }
      return r[name];
    }, level);
  });
  return sortResults(result);
};
