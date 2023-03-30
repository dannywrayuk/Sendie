import * as vscode from "vscode";
import * as crypto from "crypto";
import { SidebarProvider } from "./Sidebar/SidebarProvider";
import { VirtualDocumentProvider } from "./virtualDocumentProvider";
import { executeDocument } from "./commands/executeDocument";
import { openCurrentContext } from "./commands/openCurrentContext";
import { findFileInTabs } from "./utils/findFileInTabs";

export function activate(context: vscode.ExtensionContext) {
  const rootPath =
    vscode.workspace.workspaceFolders &&
    vscode.workspace.workspaceFolders.length > 0
      ? vscode.workspace.workspaceFolders[0].uri.fsPath
      : "";

  const virtualDocumentProvider = new VirtualDocumentProvider("sendie");
  const responseDocumentTitle = "Sendie Response";
  const responseDocumentUri = virtualDocumentProvider.getUri(
    responseDocumentTitle
  );
  vscode.workspace.registerTextDocumentContentProvider(
    virtualDocumentProvider.uriScheme,
    virtualDocumentProvider
  );

  const sidebarProvider = new SidebarProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider("sendie-sidebar", sidebarProvider)
  );

  // Commands
  vscode.commands.registerCommand(
    "sendie.openResponseDocument",
    async (data) => {
      const options = {
        viewColumn: vscode.ViewColumn.Beside,
        // make this optional, focus on request send. update only if visible?
        updateOnly: true,
      };

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
        responseDocumentTitle + " " + crypto.randomUUID()
      ),
      (await vscode.workspace.openTextDocument(responseDocumentUri)).getText()
    );
  });

  vscode.commands.registerCommand("sendie.executeDocument", executeDocument);
  vscode.commands.registerCommand(
    "sendie.openCurrentContext",
    openCurrentContext
  );
}
