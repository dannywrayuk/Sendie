import * as fs from "fs";
import fetch, { HeadersInit, RequestInit, Response } from "node-fetch";
import { createErrorDocument, createResponseDocument } from "./createDocument";

export interface Request {
  type: "request";
  name?: string;
  method?: "GET" | "POST";
  address: string;
  headers?: HeadersInit;
  body?: object | string;
}

export interface Collection {
  type: "collection";
  name?: string;
  children: RequestItem[];
}

export type RequestItem = Request | Collection;
type RequestTree = RequestItem[] | RequestItem;

const getFromIndex = (data: RequestTree, indexArray: number[]) =>
  indexArray.reduce((acc, index): RequestTree => {
    if (Array.isArray(acc)) {
      return acc[index];
    }
    if (acc.type === "collection" && acc.children) {
      return acc.children[index];
    }
    return acc;
  }, data);

const getRequestData = (path: string, indexArray: number[] = []): Request => {
  const fileString = fs.readFileSync(path).toString();
  const collectionData: RequestTree = JSON.parse(fileString);
  const requestData = getFromIndex(collectionData, indexArray) as Request;
  return requestData;
};

const getResponseData = async (
  requestData: Request
): Promise<Response | { error: string }> => {
  const options: RequestInit = {
    method: requestData.method || "GET",
    headers: requestData.headers,
    body: JSON.stringify(requestData.body),
  };
  if (options.method === "GET") {
    options.body = undefined;
  }
  if (typeof requestData?.address !== "string") {
    return { error: "Address is undefined" };
  }
  let response;
  try {
    response = await fetch(requestData.address, options);
  } catch (e: any) {
    return { error: e.stack };
  }
  return response;
};

const createTitle = (requestData: Request) => {
  const time = new Date();
  return `${requestData.name} ${time.toLocaleTimeString()}, ${time
    .toLocaleDateString()
    .replace(/\//g, ".")}`;
};

export const sendRequest = async (
  {
    path,
    index,
  }: {
    path: string;
    index: number[];
  },
  context?: string
) => {
  let requestData = getRequestData(path, index);
  if (context && context !== "") {
    let requestString = JSON.stringify(requestData);
    const currentContext = JSON.parse(fs.readFileSync(context).toString());
    Object.entries(currentContext?.values).forEach(([key, value]) => {
      requestString = requestString.replace(
        new RegExp(`\\\$\\\{${key}\\\}`, "g"),
        typeof value === "string" ? value : ""
      );
    });
    requestData = JSON.parse(requestString);
  }

  const title = createTitle(requestData);
  const responseData = await getResponseData(requestData);
  let responseDocument;
  if ("error" in responseData) {
    responseDocument = await createErrorDocument(
      title,
      requestData,
      responseData
    );
  } else {
    responseDocument = await createResponseDocument(
      title,
      requestData,
      responseData
    );
  }
  return { document: responseDocument, title };
};
