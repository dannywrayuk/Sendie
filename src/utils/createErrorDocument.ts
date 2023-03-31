import * as YAML from "yaml";

export const createErrorDocument = (
  title: string,
  requestData: any,
  error: string
) => {
  const document = {
    error,
    request: {
      headers: {
        ...requestData.headers,
      },
      body: JSON.stringify(requestData.body, null, 2),
    },
  };

  const YAMLDocument = new YAML.Document(document);
  YAMLDocument.commentBefore = ` Sendie - ${title}`;

  return YAMLDocument.toString().replace(/body\: \|\-/g, "body:");
};
