import * as vscode from "vscode";
import * as fs from "fs";
import fetch from "node-fetch";
import { createResponseDocument } from "../utils/createResponseDocument";

const toObject = (data: string) => {
  return JSON.parse(data);
};

const parseBody = (body: any) => {
  if (typeof body === "string") return body;
  return JSON.stringify(body);
};

const toNodeFetchRequest = (dataObject: any) => {
  const url: string = dataObject.address;
  const params: object = {
    method: dataObject.method,
    headers: dataObject.headers,
    body: parseBody(dataObject.body),
  };
  const request: [string, object] = [url, params];
  return request;
};

export const executeDocument = async (fileUriString: string) => {
  const path = vscode.Uri.parse(fileUriString).fsPath;
  const data = fs.readFileSync(path).toString();
  const dataObject = toObject(data);
  const request = toNodeFetchRequest(dataObject);
  const response = await fetch(...request);
  const responseDocument = createResponseDocument(
    dataObject.name,
    dataObject,
    response
  );
  vscode.commands.executeCommand(
    "sendie.openResponseDocument",
    responseDocument
  );
};
