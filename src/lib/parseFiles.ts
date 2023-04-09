export const parseSendieDocument = (document: string) => {
  try {
    return JSON.parse(document);
  } catch (e) {}
  return;
};

export const parseSendieContext = (document: string) => {
  try {
    return JSON.parse(document);
  } catch (e) {}
  return;
};
