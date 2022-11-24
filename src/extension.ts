"use strict";

import * as vscode from "vscode";
import * as fs from "fs";
import fetch from "node-fetch";

import { RequestTreeProvider } from "./RequestTreeProvider";
import { VirtualDocumentProvider } from "./virtualDocumentProvider";

const getFromIndex = (data: any, indexArray: any[]) =>
  indexArray.reduce((acc, index) => {
    if (Array.isArray(acc)) {
      return acc[index];
    }
    if (acc.children) {
      return acc.children[index];
    }
  }, data);

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
    async (args) => {
      const collectionData = JSON.parse(fs.readFileSync(args.path).toString());
      const requestData = getFromIndex(collectionData, args.indexArray || []);
      console.log(requestData);

      const time = new Date();
      const title = `${requestData.name}: ${time.toLocaleTimeString()}, ${time
        .toLocaleDateString()
        .replace(/\//g, ".")}`;
      console.log(title);
      const res = await fetch(requestData.address);
      console.log(res);

      virtualDocumentProvider.setContent(await res.text());
      let uri = vscode.Uri.parse("sendie:" + title);
      let doc = await vscode.workspace.openTextDocument(uri);
      await vscode.window.showTextDocument(doc, { preview: false });
    }
  );

  context.subscriptions.push(disposable);
}
