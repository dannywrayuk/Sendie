import * as vscode from "vscode";

export class VirtualDocumentProvider
  implements vscode.TextDocumentContentProvider
{
  private content: string = "";
  provideTextDocumentContent(uri: vscode.Uri): string {
    return this.content;
  }

  async openDocument(content: string, title: string) {
    this.content = content;
    let uri = vscode.Uri.parse("sendie:" + title);
    let doc = await vscode.workspace.openTextDocument(uri);
    await vscode.window.showTextDocument(doc, { preview: false });
  }
}
