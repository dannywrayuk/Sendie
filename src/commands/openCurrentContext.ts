import * as vscode from "vscode";
import { extensionContext } from "../utils/extensionContext";
import { workspaceStateKeys } from "../constants";

export const openCurrentContext = async () => {
  const currentContextUri = vscode.Uri.parse(
    (
      extensionContext.workspaceState.get(
        workspaceStateKeys.currentContext
      ) as vscode.Uri
    )?.fsPath
  );
  if (!currentContextUri) {
    vscode.window.showErrorMessage("No context has been set");
    return;
  }

  try {
    await vscode.workspace.fs.stat(currentContextUri);
  } catch (e) {
    vscode.window.showErrorMessage(
      "Can't find specified context file. \n" + currentContextUri.fsPath
    );
    return;
  }

  vscode.window.showTextDocument(currentContextUri);
};
