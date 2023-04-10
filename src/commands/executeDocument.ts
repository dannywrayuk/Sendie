import * as vscode from "vscode";
import fetch from "node-fetch";
import {
  createResponseDocument,
  createErrorDocument,
} from "../lib/createResponseDocument";
import { parseSendieContext, parseSendieDocument } from "../lib/parseFiles";
import { extensionContext } from "../utils/extensionContext";
import { workspaceStateKeys } from "../constants";
import { getFile } from "../utils/fs";

const parseBody = (body: any) => {
  if (typeof body === "string") return body;
  return JSON.stringify(body);
};

const toNodeFetchRequest = (requestObject: any) => {
  if (typeof requestObject.address !== "string")
    throw new Error("Request must have an address.");
  const url: string = requestObject.address;
  const params: object = {
    method: requestObject.method,
    headers: requestObject.headers,
    body: parseBody(requestObject.body),
  };
  const request: [string, object] = [url, params];
  return request;
};

const applyContext = async (requestData: string) => {
  const currentContext: vscode.Uri | undefined =
    extensionContext.workspaceState.get(workspaceStateKeys.currentContext);
  if (!currentContext) return requestData;
  const contextData = getFile(currentContext);
  if (!contextData) {
    vscode.window.showErrorMessage(
      "Error when reading the current context file. Has it been deleted or movied?"
    );
    return requestData;
  }
  const contextObject = await parseSendieContext(contextData);
  if (!contextObject || !contextObject.values) {
    vscode.window.showErrorMessage(
      "Error when parsing the current context file. Check it's format."
    );
    return requestData;
  }
  requestData = requestData.replace(
    /\${(.*?)}/g,
    (_, group) => contextObject.values?.[group] || ""
  );
  return requestData;
};

export const executeDocument = async (fileUri: string) => {
  const data = getFile(vscode.Uri.parse(fileUri));
  if (!data) {
    vscode.window.showErrorMessage(
      "Error when reading the current request file. Has it been deleted or movied?"
    );
    return;
  }
  const withContext = await applyContext(data);
  const requestObject = await parseSendieDocument(withContext);
  if (!requestObject) {
    vscode.window.showErrorMessage(
      "Error when parsing the current request file. Check it's format."
    );
    return;
  }
  let outputDocument;
  try {
    const request = toNodeFetchRequest(requestObject);
    const response = await fetch(...request);
    outputDocument = createResponseDocument(
      // @ts-ignore
      requestObject.name,
      requestObject,
      response
    );
  } catch (error) {
    outputDocument = createErrorDocument(
      // @ts-ignore
      requestObject.name,
      requestObject,
      (error as Error).stack || "Unknown Error."
    );
  }
  vscode.commands.executeCommand("sendie.openResponseDocument", outputDocument);
};
