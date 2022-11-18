"use strict";

import * as vscode from "vscode";
import * as fs from "fs";
import fetch from "node-fetch";

import { RequestTreeProvider } from "./RequestTreeProvider";
import { VirtualDocumentProvider } from "./virtualDocumentProvider";

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
      const x = JSON.parse(fs.readFileSync(args.path).toString());
      const time = new Date();
      const title = `${x.name}: ${time.toLocaleTimeString()}, ${time
        .toLocaleDateString()
        .replace(/\//g, ".")}`;
      console.log(title);
      const res = await fetch(x.address);
      console.log(res);

      virtualDocumentProvider.setContent(await res.text());
      let uri = vscode.Uri.parse("sendie:" + title);
      let doc = await vscode.workspace.openTextDocument(uri);
      await vscode.window.showTextDocument(doc, { preview: false });
    }
  );

  context.subscriptions.push(disposable);
}
