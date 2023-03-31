import * as vscode from "vscode";

export const isDocumentVisible = (documentUri: vscode.Uri) => {
  return vscode.window.visibleTextEditors.some(
    (editor) => editor.document.uri.path === documentUri.path
  );
};
