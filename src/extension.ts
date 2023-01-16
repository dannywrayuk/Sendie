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

  const requestTreeProvider = new TreeProvider(() =>
    constructTree({
      treeConstants: {
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
  );

  const contextTreeProvider = new TreeProvider(() =>
    constructTree({
      treeConstants: {
        root: rootPath,
        globString: "**/*.sendie-context.{js,json}",
        selected: context.workspaceState.get("currentContext"),
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
          iconPath:
            itemInfo?.path === data.treeConstants?.selected
              ? new vscode.ThemeIcon("star")
              : new vscode.ThemeIcon("list-selection"),
        }),
      },
    })
  );

  vscode.window.registerTreeDataProvider("sendie-context", contextTreeProvider);
  vscode.window.registerTreeDataProvider("sendie-request", requestTreeProvider);

  vscode.commands.registerCommand("sendie.sendRequest", async (args) => {
    const response = await sendRequest(
      args,
      context.workspaceState.get("currentContext")
    );
    virtualDocumentProvider.openDocument(response.document, response.title);
  });
  vscode.commands.registerCommand("sendie.goToFile", async (args) => {
    vscode.commands.executeCommand("vscode.open", vscode.Uri.file(args.path));
  });
  vscode.commands.registerCommand("sendie.refreshRequest", async () =>
    requestTreeProvider.refresh()
  );
  vscode.commands.registerCommand("sendie.refreshContext", async () =>
    contextTreeProvider.refresh()
  );
  vscode.commands.registerCommand("sendie.adoptContext", async (args) => {
    context.workspaceState.update("currentContext", args.path);
    contextTreeProvider.refresh();
  });
  vscode.commands.registerCommand("sendie.openCurrentContext", async () => {
    const currentContext = context.workspaceState.get("currentContext");
    if (currentContext) {
      vscode.commands.executeCommand("sendie.goToFile", {
        path: currentContext,
      });
    } else {
      vscode.window.showErrorMessage("Context not set");
    }
  });
}
