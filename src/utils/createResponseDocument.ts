import { Response } from "node-fetch";
import * as YAML from "yaml";
import { getReasonPhrase } from "http-status-codes";
import { NodeBase } from "yaml/dist/nodes/Node";

const addStatusComment = (YAMLDocument: YAML.Document, statusCode: number) => {
  const generalYAML = YAMLDocument.get("general") as YAML.YAMLMap;
  const statusCodeYAML = generalYAML?.get("statusCode", true) as NodeBase;
  if (statusCodeYAML) {
    const emoji = statusCode < 299 ? "✅" : "❌";
    statusCodeYAML.comment = ` ${emoji} ${getReasonPhrase(statusCode)}`;
  }
};

export const createResponseDocument = async (
  title: string,
  requestData: any,
  responseData: Response
) => {
  let responseBody = await responseData.text();
  try {
    responseBody = JSON.stringify(JSON.parse(responseBody), null, 2);
  } catch (e) {}

  const document = {
    general: {
      requestURL: requestData.address,
      requestMethod: requestData.method,
      statusCode: responseData.status,
    },
    response: {
      headers: Object.fromEntries(responseData.headers.entries()),
      body: responseBody,
    },
    request: {
      headers: {
        ...requestData.headers,
      },
      body: JSON.stringify(requestData.body, null, 2),
    },
  };

  const YAMLDocument = new YAML.Document(document);
  YAMLDocument.commentBefore = ` Sendie - ${title}`;
  addStatusComment(YAMLDocument, document.general.statusCode);

  return YAMLDocument.toString().replace(/body\: \|\-/g, "body:");
};
