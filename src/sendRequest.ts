import * as fs from "fs";
import fetch, { HeadersInit, RequestInit, Response } from "node-fetch";

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
  return await fetch(requestData.address, options);
};

const createTitle = (requestData: Request) => {
  const time = new Date();
  return `${requestData.name}: ${time.toLocaleTimeString()}, ${time
    .toLocaleDateString()
    .replace(/\//g, ".")}`;
};

const createResponseDocument = async (responseData: Response) => {
  return await responseData.text();
};

export const sendRequest =
  // Not sure how else to get the vdp into the function, might have to revisit this.
  (virtualDocumentProvider: any) => async (args: any) => {
    const requestData = getRequestData(args.path, args.indexArray);
    const responseData = await getResponseData(requestData);
    const responseDocument = await createResponseDocument(responseData);

    const title = createTitle(requestData);
    virtualDocumentProvider.openDocument(responseDocument, title);
  };
