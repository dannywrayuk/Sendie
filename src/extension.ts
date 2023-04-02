import * as vscode from "vscode";
import { VirtualDocumentProvider } from "./virtualDocumentProvider";
import { executeDocument } from "./commands/executeDocument";
import { openCurrentContext } from "./commands/openCurrentContext";
import { createSendieRequest } from "./commands/createSendieRequest";
import { findFileInTabs } from "./utils/findFileInTabs";
import { isDocumentVisible } from "./utils/isDocumentVisible";

export function activate(context: vscode.ExtensionContext) {
  const config = vscode.workspace.getConfiguration("sendie");

  const virtualDocumentProvider = new VirtualDocumentProvider("sendie");
  const responseDocumentTitle = "Sendie Response";
  const responseDocumentUri = virtualDocumentProvider.getUri(
    responseDocumentTitle
  );
  vscode.workspace.registerTextDocumentContentProvider(
    virtualDocumentProvider.uriScheme,
    virtualDocumentProvider
  );

  // Commands
  vscode.commands.registerCommand(
    "sendie.openResponseDocument",
    async (data) => {
      if (config.alwaysHoldDocuments === "true") {
        vscode.commands.executeCommand("sendie.holdResponseDocument", data);
      }

      const options = {
        viewColumn:
          config.defaultResponsePosition === "On Top"
            ? vscode.ViewColumn.Active
            : vscode.ViewColumn.Beside,
        updateOnly: config.autoFocusResponse === "Never",
      };

      if (config.autoFocusResponse === "Only if Hidden") {
        options.updateOnly = isDocumentVisible(responseDocumentUri);
      }

      const responseDocumentTabs = findFileInTabs(responseDocumentUri);
      if (responseDocumentTabs.length === 0) {
        options.updateOnly = false;
      } else if (responseDocumentTabs.length === 1) {
        options.viewColumn = responseDocumentTabs[0].group.viewColumn;
      } else if (responseDocumentTabs.length > 1) {
        vscode.window.tabGroups.close(responseDocumentTabs);
      }
      virtualDocumentProvider.createDocument(
        responseDocumentUri,
        data || "\nNothing yet 😴\n",
        options
      );
    }
  );

  vscode.commands.registerCommand("sendie.holdResponseDocument", async () => {
    virtualDocumentProvider.createDocument(
      virtualDocumentProvider.getUri(
        `${responseDocumentTitle}: ${new Date().toLocaleTimeString()}`
      ),
      (await vscode.workspace.openTextDocument(responseDocumentUri)).getText()
    );
  });

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
