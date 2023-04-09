import * as vscode from "vscode";
import { VirtualDocumentProvider } from "./virtualDocumentProvider";
import { executeDocument } from "./commands/executeDocument";
import { openCurrentContext } from "./commands/openCurrentContext";
import { createSendieRequest } from "./commands/createSendieRequest";

import { extensionContext } from "./utils/extensionContext";
import { workspaceStateKeys } from "./constants";
import { openResponseDocument } from "./commands/openResponseDocument";

export const virtualDocumentProvider = new VirtualDocumentProvider("sendie");
export const extensionConfig = vscode.workspace.getConfiguration("sendie");
export const responseDocumentTitle = "Sendie Response";
export const responseDocumentUri = virtualDocumentProvider.getUri(
  responseDocumentTitle
);

export function activate(context: vscode.ExtensionContext) {
  extensionContext.setContext(context);
  vscode.workspace.registerTextDocumentContentProvider(
    virtualDocumentProvider.uriScheme,
    virtualDocumentProvider
  );

  // Inline Commands

  vscode.commands.registerCommand("sendie.holdResponseDocument", async () => {
    virtualDocumentProvider.createDocument(
      virtualDocumentProvider.getUri(
        `${responseDocumentTitle}: ${new Date().toLocaleTimeString()}`
      ),
      (await vscode.workspace.openTextDocument(responseDocumentUri)).getText()
    );
  });

  vscode.commands.registerCommand("sendie.setContext", (data) => {
    extensionContext.workspaceState.update(
      workspaceStateKeys.currentContext,
      data
    );
  });

  // Commands

  vscode.commands.registerCommand(
    "sendie.openResponseDocument",
    openResponseDocument
  );
  vscode.commands.registerCommand(
    "sendie.createSendieRequest",
    createSendieRequest
  );
  vscode.commands.registerCommand("sendie.executeDocument", executeDocument);
  vscode.commands.registerCommand(
    "sendie.openCurrentContext",
    openCurrentContext
  );
}
