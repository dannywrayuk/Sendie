import * as fs from "fs";
import * as path from "path";
import * as glob from "glob";
import * as vscode from "vscode";
import { pathsToTree } from "./utils/pathsToTree";

const ignore = ["node_modules/**", "dist/**"];

type ItemInfo = {
  path: string;
  index: number | number[];
};

type TreeConstants = {
  root: string;
  globString: string;
} & any;

type ItemBuilder = (
  itemInfo: ItemInfo,
  data: any,
  callback: (items: any) => any
) => any;

type ConstructTreeProps = {
  treeConstants: TreeConstants;
  itemBuilders?: {
    match: (item: any) => string;
    [id: string]: ItemBuilder | ((item: any) => string);
  };
};

const findFiles = ({ root, globString }: TreeConstants) =>
  glob
    .sync(path.join(root, globString), { ignore })
    .map((file) => path.relative(root, file));

const sortFileTree = (fileTree: any) => {
  fileTree.forEach(
    (sibling: any) => sibling?.children && sortFileTree(sibling.children)
  );
  fileTree.sort((a: any, b: any) => {
    if (a.children && !b.children) return -1;
    if (!a.children && b.children) return 1;
    return (a.label as any) - (b.label as any);
  });
  return fileTree;
};

const splitPaths = (filePath: string) => {
  const filePathArray = filePath.split(path.sep);
  if (filePathArray[0] === "sendie") return filePathArray.slice(1);
  if (filePathArray.length > 2) return filePathArray.slice(-2);
  return filePathArray;
};

const createDirectory = ({
  name,
  children,
}: {
  name: string;
  children: object[];
}) => ({
  label: name,
  children,
  contextValue: "folder",
  collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
});

const defaultItemBuilders = {
  any: (itemInfo: ItemInfo, data: any) => ({ ...itemInfo, ...data }),
  match: () => "any",
};

export const constructTree = ({
  treeConstants,
  itemBuilders = defaultItemBuilders,
}: ConstructTreeProps) => {
  const filePaths: string[] = findFiles(treeConstants);

  const parseItems: any = (
    items: any[],
    filePath: string,
    parentIndex?: number | number[]
  ) =>
    items.map((data, index) => {
      const type = itemBuilders?.match(data);
      const childIndex = ([] as number[])
        .concat(parentIndex || [])
        .concat(index);

      return itemBuilders[type]?.(
        { path: filePath, index: childIndex },
        { ...data, treeConstants },
        (childItems: any[]) => parseItems(childItems, filePath, childIndex)
      );
    });

  const parseFile = (filePath: string) => {
    const data = fs
      .readFileSync(path.join(treeConstants.root, filePath))
      .toString();
    let parsedData = [];
    if (path.extname(filePath) === ".json") {
      parsedData = JSON.parse(data);
    }
    parsedData = [].concat(parsedData);
    parsedData = parseItems(
      parsedData,
      path.join(treeConstants.root, filePath)
    );
    return parsedData;
  };

  const fileTree = pathsToTree(filePaths, {
    splitPaths,
    parseFile,
    createDirectory,
  });

  return sortFileTree(fileTree);
};
