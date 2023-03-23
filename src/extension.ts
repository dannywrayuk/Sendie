import * as vscode from "vscode";
import { SidebarProvider } from "./Sidebar/SidebarProvider";
import { VirtualDocumentProvider } from "./virtualDocumentProvider";
import { executeSendieFile } from "./commands/executeSendieFile";
import { openCurrentContext } from "./commands/openCurrentContext";
import { getNonce } from "./Sidebar/utils/getNonce";

export function activate(context: vscode.ExtensionContext) {
  const rootPath =
    vscode.workspace.workspaceFolders &&
    vscode.workspace.workspaceFolders.length > 0
      ? vscode.workspace.workspaceFolders[0].uri.fsPath
      : "";

  const virtualDocumentProvider = new VirtualDocumentProvider("sendie");
  const responseDocumentTitle = "Sendie Response Document";
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
      virtualDocumentProvider.createDocument(
        responseDocumentUri,
        data || "\nNothing yet 😴\n"
      );
    }
  );

  vscode.commands.registerCommand(
    "sendie.updateResponseDocument",
    async (data) => {
      virtualDocumentProvider.updateDocument(
        responseDocumentUri,
        new Date().toLocaleString()
      );
    }
  );

  vscode.commands.registerCommand(
    "sendie.executeSendieFile",
    executeSendieFile
  );

  vscode.commands.registerCommand("sendie.holdResponseDocument", async () => {
    virtualDocumentProvider.createDocument(
      virtualDocumentProvider.getUri(responseDocumentTitle + " " + getNonce()),
      (await vscode.workspace.openTextDocument(responseDocumentUri)).getText()
    );
  });

  vscode.commands.registerCommand(
    "sendie.openCurrentContext",
    openCurrentContext
  );
}
