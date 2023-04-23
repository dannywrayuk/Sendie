import * as vscode from "vscode";
import { VirtualDocumentProvider } from "./virtualDocumentProvider";
import { executeDocument } from "./commands/executeDocument";
import { openCurrentContext } from "./commands/openCurrentContext";
import { createSendieRequest } from "./commands/createSendieRequest";

import { extensionContext } from "./utils/extensionContext";
import { workspaceStateKeys } from "./constants";
import { openResponseDocument } from "./commands/openResponseDocument";
import { TreeProvider } from "./lib/treeProvider";
import {
  buildDocumentsView,
  buildFavouritesView,
} from "./lib/buildRequestViews";

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

  const documentsView = new TreeProvider(buildDocumentsView);
  const favouritesView = new TreeProvider(buildFavouritesView);
  const actionsView = new TreeProvider(() => [
    {
      label: "Create Empty Request",
      command: {
        title: "Create Empty Request",
        command: "sendie.createSendieRequest",
      },
    },
    {
      label: "Open Current Context",
      command: {
        title: "Open Current Context",
        command: "sendie.openCurrentContext",
      },
    },
  ]);
  vscode.window.registerTreeDataProvider("sendie-documents", documentsView);
  vscode.window.registerTreeDataProvider("sendie-favourites", favouritesView);
  vscode.window.registerTreeDataProvider("sendie-quick-actions", actionsView);

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
    if (data.meta) {
      extensionContext.workspaceState.update(
        workspaceStateKeys.currentContext,
        vscode.Uri.parse(data?.meta?.absolutePath)
      );
    } else {
      extensionContext.workspaceState.update(
        workspaceStateKeys.currentContext,
        data
      );
    }
  });

  vscode.commands.registerCommand("sendie.refreshDocuments", () =>
    documentsView.refresh()
  );
  vscode.commands.registerCommand("sendie.refreshFavourites", () =>
    favouritesView.refresh()
  );
  vscode.commands.registerCommand(
    "sendie.openFileUI",
    (data) =>
      data &&
      vscode.window.showTextDocument(vscode.Uri.parse(data?.meta?.absolutePath))
  );

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
