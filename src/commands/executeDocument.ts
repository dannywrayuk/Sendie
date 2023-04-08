import * as vscode from "vscode";
import * as fs from "fs";
import fetch from "node-fetch";
import { createResponseDocument } from "../utils/createResponseDocument";
import { createErrorDocument } from "../utils/createErrorDocument";
import {
  parseSendieContext,
  parseSendieDocument,
} from "../utils/parseSendieDocument";
import { extensionContext } from "../utils/extensionContext";
import { workspaceStateKeys } from "../constants";

const parseBody = (body: any) => {
  if (typeof body === "string") return body;
  return JSON.stringify(body);
};

const toNodeFetchRequest = (dataObject: any) => {
  if (typeof dataObject.address !== "string")
    throw new Error("Request must have an address.");
  const url: string = dataObject.address;
  const params: object = {
    method: dataObject.method,
    headers: dataObject.headers,
    body: parseBody(dataObject.body),
  };
  const request: [string, object] = [url, params];
  return request;
};

const applyContext = (x: any) => {
  const currentContext = extensionContext.workspaceState.get(
    workspaceStateKeys.currentContext
  );

  if (!currentContext) return x;
  try {
    const data = fs.readFileSync(String(currentContext)).toString();
    const dataObject = parseSendieContext(data);
    x = (x as string).replace(
      /\${(.*?)}/g,
      (_, group) => dataObject?.values?.[group] || ""
    );
  } catch (e) {}
  return x;
};

export const executeDocument = async (fileUriString: string) => {
  const path = vscode.Uri.parse(fileUriString).fsPath;
  const data = fs.readFileSync(path).toString();
  const withContext = applyContext(data);
  const dataObject = parseSendieDocument(withContext);
  let outputDocument;
  try {
    const request = toNodeFetchRequest(dataObject);
    const response = await fetch(...request);
    outputDocument = createResponseDocument(
      dataObject.name,
      dataObject,
      response
    );
  } catch (error) {
    outputDocument = createErrorDocument(
      dataObject.name,
      dataObject,
      (error as Error).stack || "Unknown Error."
    );
  }
  vscode.commands.executeCommand("sendie.openResponseDocument", outputDocument);
};
