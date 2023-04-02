import * as vscode from "vscode";

const template = {
  name: "Request Name",
  method: "GET",
  address: "https://dannywray.co.uk/hello.txt",
  headers: {},
};

export const createSendieRequest = async () => {
  const rootPath =
    vscode.workspace.workspaceFolders &&
    vscode.workspace.workspaceFolders.length > 0
      ? vscode.workspace.workspaceFolders[0].uri
      : vscode.Uri.parse("");
  const documentUri = vscode.Uri.joinPath(rootPath, "example.sendie.json").with(
    { scheme: "untitled" }
  );
  const edit = new vscode.WorkspaceEdit();
  edit.insert(
    documentUri,
    new vscode.Position(0, 0),
    JSON.stringify(template, null, 2)
  );
  await vscode.workspace.applyEdit(edit);
  vscode.window.showTextDocument(documentUri, { preview: false });
};
