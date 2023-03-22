import * as vscode from "vscode";
import { SidebarProvider } from "./Sidebar/SidebarProvider";
import { VirtualDocumentProvider } from "./virtualDocumentProvider";

export function activate(context: vscode.ExtensionContext) {
  const rootPath =
    vscode.workspace.workspaceFolders &&
    vscode.workspace.workspaceFolders.length > 0
      ? vscode.workspace.workspaceFolders[0].uri.fsPath
      : "";

  const virtualDocumentProvider = new VirtualDocumentProvider();
  vscode.workspace.registerTextDocumentContentProvider(
    "sendie",
    virtualDocumentProvider
  );

  const sidebarProvider = new SidebarProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider("sendie-sidebar", sidebarProvider)
  );

  vscode.commands.registerCommand("sendie.openResponseDocument", async () => {
    virtualDocumentProvider.openDocument(
      "Sendie Response Document",
      "\nNothing yet 😴\n"
    );
  });

  vscode.commands.registerCommand("sendie.updateResponseDocument", async () => {
    virtualDocumentProvider.updateDocument(
      "Sendie Response Document",
      "\nUpdated\n"
    );
  });
}
