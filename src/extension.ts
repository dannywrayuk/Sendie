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
            iconPath: new vscode.ThemeIcon("mail"),
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
            command: {
              command: "vscode.open",
              arguments: [itemInfo.path],
            },
            iconPath: data?.adopted
              ? new vscode.ThemeIcon("star")
              : new vscode.ThemeIcon("list-selection"),
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

  disposable = vscode.commands.registerCommand(
    "sendie.goToFile",
    async (args) => {
      let doc = await vscode.workspace.openTextDocument(args.path);
      await vscode.window.showTextDocument(doc, { preview: false });
    }
  );
  context.subscriptions.push(disposable);
}
