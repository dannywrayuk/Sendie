import * as vscode from "vscode";
import {
  extensionConfig,
  virtualDocumentProvider,
  responseDocumentUri,
} from "../extension";
import { findFileInTabs, isDocumentVisible } from "../utils/vscode";

export const openResponseDocument = (data: string) => {
  if (extensionConfig.alwaysHoldDocuments === "true") {
    vscode.commands.executeCommand("sendie.holdResponseDocument", data);
  }

  const options = {
    viewColumn:
      extensionConfig.defaultResponsePosition === "On Top"
        ? vscode.ViewColumn.Active
        : vscode.ViewColumn.Beside,
    updateOnly: extensionConfig.autoFocusResponse === "Never",
  };

  if (extensionConfig.autoFocusResponse === "Only if Hidden") {
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
};
