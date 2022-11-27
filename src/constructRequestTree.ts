import * as fs from "fs";
import * as path from "path";
import * as glob from "glob";
import * as vscode from "vscode";
import { RequestTreeItem } from "./RequestTreeProvider";
import { Collection, Request, RequestItem } from "./sendRequest";

const ignore = ["node_modules/**", "dist/**"];

const findRequestFiles = (root: string = "") => {
  return glob
    .sync(path.join(root, "**/*.sendie.{js,json}"), { ignore })
    .map((file) => path.relative(root, file));
};

interface constructorProps<T> {
  data: T;
  path: string;
  indexArray?: number[];
}

const constructRequest = ({
  data,
  path,
  indexArray,
}: constructorProps<Request>): RequestTreeItem => ({
  label: data.name,
  path,
  indexArray,
  iconPath: new vscode.ThemeIcon("mail"),
});

const constructCollection = ({
  data,
  path,
  indexArray,
}: constructorProps<Collection>): RequestTreeItem => ({
  label: data.name,
  collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
  contextValue: "folder",
  children: constructItem({
    data: data.children,
    path,
    indexArray,
  }) as RequestTreeItem[],
});

const constructItem = ({
  data,
  indexArray = [],
  path,
}: constructorProps<RequestItem[] | RequestItem>):
  | RequestTreeItem
  | RequestTreeItem[] => {
  if (Array.isArray(data)) {
    return data.map((x, index) => {
      const childIndex = Array.from(indexArray);
      childIndex.push(index);
      return constructItem({
        data: x,
        indexArray: childIndex,
        path,
      }) as RequestTreeItem;
    });
  }
  switch (data.type) {
    case "request":
      return constructRequest({ data, path, indexArray });
    case "collection":
      return constructCollection({ data, path, indexArray });
    default:
      console.log("Unknown Type");
      return [];
  }
};

const parseRequestFile = (
  requestFilePath: string
): RequestTreeItem | RequestTreeItem[] => {
  const data = fs.readFileSync(requestFilePath).toString();
  if (path.extname(requestFilePath) === ".json") {
    const parsedData = JSON.parse(data);
    return constructItem({ data: parsedData, path: requestFilePath });
  }
  return [];
};

const splitFilePath = (filePath: string) => {
  const filePathArray = filePath.split(path.sep);
  if (filePathArray[0] === "sendie") return filePathArray.slice(1);
  if (filePathArray.length > 2) return filePathArray.slice(-2);
  return filePathArray;
};

const sortResults = (results: RequestTreeItem[]) => {
  results.forEach(
    (result: RequestTreeItem) =>
      result?.children && sortResults(result.children)
  );
  results.sort((a: RequestTreeItem, b: RequestTreeItem) => {
    if (a.children && !b.children) return -1;
    if (!a.children && b.children) return 1;
    return (a.label as any) - (b.label as any);
  });
  return results;
};

interface LevelType {
  result: RequestTreeItem[];
  [name: string]: LevelType | RequestTreeItem[];
}

export const constructRequestTree = (root: string): RequestTreeItem[] => {
  const requestFilePaths: string[] = findRequestFiles(root);
  // This was stolen from StackOverflow and converts filePath arrays to fileTree like objects.
  // It wasn't written with ts in mind, so pls ignore the gross types.
  let result: RequestTreeItem[] = [];
  let level: LevelType = { result };
  requestFilePaths.forEach((requestFilePath: string) => {
    splitFilePath(requestFilePath).reduce(
      (r: LevelType, name: string): LevelType => {
        if (!r[name]) {
          r[name] = { result: [] };
          if (name === path.basename(requestFilePath)) {
            const parsedRequests = parseRequestFile(
              path.join(root, requestFilePath)
            );
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
              collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
              contextValue: "folder",
              children: (r[name] as LevelType).result,
            });
          }
        }
        return r[name] as LevelType;
      },
      level
    );
  });
  return sortResults(result);
};
