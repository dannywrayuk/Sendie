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

const getRequestData = (path: any, indexArray: any) => {
  const collectionData = JSON.parse(fs.readFileSync(path).toString());
  const requestData = getFromIndex(collectionData, indexArray || []);
  return requestData;
};

const getResponseData = async (requestData: any) => {
  const options = {
    method: requestData.method,
    headers: requestData.headers,
    body: JSON.stringify(requestData.body),
  };
  return await fetch(requestData.address, options);
};

const createTitle = (requestData: any) => {
  const time = new Date();
  return `${requestData.name}: ${time.toLocaleTimeString()}, ${time
    .toLocaleDateString()
    .replace(/\//g, ".")}`;
};

const createResponseDocument = async (responseData: any) => {
  return await responseData.text();
};

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
      const requestData = getRequestData(args.path, args.indexArray);
      const responseData = await getResponseData(requestData);
      const responseDocument = await createResponseDocument(responseData);

      const title = createTitle(requestData);
      virtualDocumentProvider.openDocument(responseDocument, title);
    }
  );

  context.subscriptions.push(disposable);
}
