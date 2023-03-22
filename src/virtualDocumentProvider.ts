import * as vscode from "vscode";

export class VirtualDocumentProvider
  implements vscode.TextDocumentContentProvider
{
  private content: string = "";
  provideTextDocumentContent(uri: vscode.Uri): string {
    return this.content;
  }

  onDidChangeEmitter = new vscode.EventEmitter<vscode.Uri>();
  onDidChange = this.onDidChangeEmitter.event;

  async openDocument(title: string, content: string) {
    this.content = content;
    let uri = vscode.Uri.parse("sendie:" + title);
    let doc = await vscode.workspace.openTextDocument(uri);
    await vscode.window.showTextDocument(doc, { preview: false });
  }

  updateDocument(title: string, content: string) {
    this.content = content;
    let uri = vscode.Uri.parse("sendie:" + title);
    this.onDidChangeEmitter.fire(uri);
  }
}
