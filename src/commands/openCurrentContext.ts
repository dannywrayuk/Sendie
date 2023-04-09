import * as vscode from "vscode";
import { extensionContext } from "../utils/extensionContext";
import { workspaceStateKeys } from "../constants";

export const openCurrentContext = () => {
  vscode.window.showTextDocument(
    vscode.Uri.parse(
      extensionContext.workspaceState.get(workspaceStateKeys.currentContext) ||
        ""
    )
  );
};
