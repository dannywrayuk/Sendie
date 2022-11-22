import * as fs from "fs";
import * as path from "path";
import * as glob from "glob";

const ignore = ["node_modules/**", "dist/**"];

const findRequestFiles = (root: string = "") => {
  return glob
    .sync(path.join(root, "**/*.sendie.{js,json}"), { ignore })
    .map((file) => path.relative(root, file));
};

const constructRequest = ({ data, path, index }: any): any => {
  return { label: data.name, path, index };
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
      console.log("no type");
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

export const constructRequestTree = (root: string): any => {
  let result: any = [];
  let level = { result };
  const requestFiles = findRequestFiles(root);
  requestFiles.forEach((dir: any) => {
    dir.split(path.sep).reduce((r: any, name: any) => {
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

  return result;
};
