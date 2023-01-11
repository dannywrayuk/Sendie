import * as fs from "fs";
import fetch, { HeadersInit, RequestInit } from "node-fetch";
import { createResponseDocument } from "./createResponseDocument";

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
  const collectionData: RequestTree = JSON.parse(
    fs.readFileSync(path).toString()
  );
  const requestData = getFromIndex(collectionData, indexArray) as Request;
  return requestData;
};

const getResponseData = async (requestData: Request) => {
  const options: RequestInit = {
    method: requestData.method || "GET",
    headers: requestData.headers,
    body: JSON.stringify(requestData.body),
  };
  if (options.method === "GET") {
    options.body = undefined;
  }
  return await fetch(requestData.address, options);
};

const createTitle = (requestData: Request) => {
  const time = new Date();
  return `${requestData.name} ${time.toLocaleTimeString()}, ${time
    .toLocaleDateString()
    .replace(/\//g, ".")}`;
};

export const sendRequest = async ({
  path,
  index,
}: {
  path: string;
  index: number[];
}) => {
  const requestData = getRequestData(path, index);
  const title = createTitle(requestData);
  const responseData = await getResponseData(requestData);
  const responseDocument = await createResponseDocument(
    title,
    requestData,
    responseData
  );
  return { document: responseDocument, title };
};
