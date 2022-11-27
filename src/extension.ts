"use strict";

import * as vscode from "vscode";

import { RequestTreeProvider } from "./RequestTreeProvider";
import { VirtualDocumentProvider } from "./virtualDocumentProvider";
import { sendRequest } from "./sendRequest";

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
    new RequestTreeProvider(rootPath)
  );

  let disposable = vscode.commands.registerCommand(
    "sendie.sendRequest",
    sendRequest(virtualDocumentProvider)
  );

  context.subscriptions.push(disposable);
}
