import * as vscode from "vscode";

type ExtensionContextWithSet = vscode.ExtensionContext & {
  setContext: (context: vscode.ExtensionContext) => undefined;
};

const initialTarget: { context: vscode.ExtensionContext | undefined } = {
  context: undefined,
};

// This is a horrific piece of JS and I love it. We are overriding the getter on the exported object to allow for the setting of a context.

export const extensionContext = new Proxy(initialTarget, {
  get(target, key) {
    if (key === "setContext") {
      return (context: vscode.ExtensionContext) => (target.context = context);
    }
    if (!target.context) {
      throw new Error(
        "Context was used before it was set. Remember to call setContext."
      );
    }
    return (target.context as { [key: string | symbol]: any })[key];
  },
}) as unknown as ExtensionContextWithSet;
