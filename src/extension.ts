"use strict";

import * as vscode from "vscode";

import { TreeProvider } from "./TreeProvider";
import { VirtualDocumentProvider } from "./virtualDocumentProvider";
import { sendRequest } from "./sendRequest";
import { constructTree } from "./constructTree";

export function activate(context: vscode.ExtensionContext) {
  const rootPath =
    vscode.workspace.workspaceFolders &&
    vscode.workspace.workspaceFolders.length > 0
      ? vscode.workspace.workspaceFolders[0].uri.fsPath
      : "";

  const virtualDocumentProvider = new VirtualDocumentProvider();
  vscode.workspace.registerTextDocumentContentProvider(
    "sendie",
    virtualDocumentProvider
  );

  vscode.window.registerTreeDataProvider(
    "requests",
    new TreeProvider(() =>
      constructTree({
        fileInfo: {
          root: rootPath,
          globString: "**/*.sendie.{js,json}",
        },
        itemBuilders: {
          match: (item) => item?.type || "request",
          request: (itemInfo, data) => ({
            ...itemInfo,
            label: data.name,
            icon: new vscode.ThemeIcon("mail"),
          }),
          collection: (itemInfo, data, callback) => ({
            ...itemInfo,
            label: data.name,
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
            contextValue: "folder",
            children: callback(data.children),
          }),
        },
      })
    )
  );

  vscode.window.registerTreeDataProvider(
    "context",
    new TreeProvider(() =>
      constructTree({
        fileInfo: {
          root: rootPath,
          globString: "**/*.sendie-context.{js,json}",
        },
        itemBuilders: {
          match: (item) => "context",
          context: (itemInfo, data) => ({
            ...itemInfo,
            label: data.name,
            icon: new vscode.ThemeIcon("mail"),
          }),
        },
      })
    )
  );

  let disposable = vscode.commands.registerCommand(
    "sendie.sendRequest",
    async (args) => {
      const response = await sendRequest(args);
      virtualDocumentProvider.openDocument(response.document, response.title);
    }
  );

  context.subscriptions.push(disposable);
}
