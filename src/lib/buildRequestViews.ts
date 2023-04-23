import * as vscode from "vscode";
import * as path from "path";
import { glob } from "glob";
import { parseSendieDocument } from "./parseFiles";
import { getFile } from "../utils/fs";
import { contextGlobSelector, requestGlobSelector } from "../constants";
import { extensionConfig } from "../extension";

function isDefined<T>(argument: T | undefined | null): argument is T {
  return !!argument;
}
function isString(argument: string | object): argument is string {
  return typeof argument === "string";
}
function isNotString(argument: string | object): argument is object {
  return typeof argument !== "string";
}

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

const getFiles = async (foundFiles: string[], rootDir?: string) =>
  (
    await Promise.all(
      foundFiles.map(async (file) => {
        const relativePath = path.relative(rootDir || "/", file);
        const data = getFile(vscode.Uri.parse(file));
        if (!data) return null;
        const parsedData = await parseSendieDocument(data);
        if (!parsedData) return null;
        const contextValue = parsedData.address ? "request" : "context";

        return {
          label: parsedData.name,
          iconPath: new vscode.ThemeIcon("mail"),
          contextValue,
          meta: {
            absolutePath: file,
            relativePath,
          },
        };
      })
    )
  )
    .filter(isDefined)
    .reduce((fileList: any[], currentFile) => {
      let parentFile = fileList;
      let newFile = currentFile as any;
      if (currentFile.meta.relativePath.startsWith("sendie" + path.sep)) {
        let searchFirst = true;
        currentFile.meta.relativePath
          .split(path.sep)
          .slice(1, -1)
          .forEach((currentDirectory) => {
            const folder =
              searchFirst &&
              parentFile.find(
                (x) => x.label === currentDirectory && x.collapsibleState
              );
            if (folder) {
              parentFile = folder.children;
            } else {
              searchFirst = false;
              newFile = {
                label: currentDirectory,
                contextValue: "folder",
                collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
                children: [newFile],
              };
            }
          });
      }
      parentFile.push(newFile);
      return fileList;
    }, []);

export const buildView = async (
  workspaces: { name: string; uri: vscode.Uri }[]
) =>
  (
    await Promise.all(
      workspaces.map(async (workspace) => {
        const requests = await getFiles(
          glob.sync(path.join(workspace.uri.fsPath, requestGlobSelector))
        );
        const contexts = await getFiles(
          glob.sync(path.join(workspace.uri.fsPath, contextGlobSelector))
        );

        if (!requests && !contexts) return null;
        return {
          label: workspace.name,
          collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
          contextValue: "rootFolder",
          children: [
            {
              label: "Requests",
              contextValue: "requestFolder",
              collapsibleState: vscode.TreeItemCollapsibleState.Expanded,
              children: requests,
            },
            {
              label: "Contexts",
              contextValue: "contextFolder",
              collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
              children: contexts,
            },
          ],
        };
      })
    )
  ).filter(isDefined);

export const buildDocumentsView = async () => {
  const workspaces = vscode.workspace.workspaceFolders;

  if (!workspaces) return;

  const viewArray = await buildView(workspaces as vscode.WorkspaceFolder[]);
  if (viewArray.length === 1) {
    return viewArray[0].children;
  }
  sortFileTree(viewArray);
  return viewArray;
};

export const buildFavouritesView = async () => {
  const favourites = extensionConfig.favourites;
  if (!favourites) return;
  try {
    let viewArray = await buildView(
      favourites.filter(isNotString) as vscode.WorkspaceFolder[]
    );
    const requests = await getFiles(favourites.filter(isString));

    viewArray = viewArray.concat(requests);
    sortFileTree(viewArray);
    return viewArray;
  } catch (e) {
    vscode.window.showErrorMessage(
      "Error when parsing favourites. Check it's format."
    );
  }
};
