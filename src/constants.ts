export const workspaceStateKeys = {
  currentContext: "currentContext",
};

export const requestGlobSelector = "**/*.sendie.{js,yaml,json}";
export const contextGlobSelector = "**/*.sendie-ctx.{js,yaml,json}";
export const requestFileRegex = new RegExp(
  "(.*\\/)(\\S+\\.sendie\\.(js|yaml|json))$"
);
export const contextFileRegex = new RegExp(
  "(.*\\/)(\\S+\\.sendie-ctx\\.(js|yaml|json))$"
);
