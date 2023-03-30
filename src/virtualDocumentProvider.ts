import * as vscode from "vscode";

export class VirtualDocumentProvider
  implements vscode.TextDocumentContentProvider
{
  private content: string = "";
  uriScheme: string = "";

  constructor(uriScheme: string) {
    this.uriScheme = uriScheme;
  }

  provideTextDocumentContent(uri: vscode.Uri): string {
    return this.content;
  }

  onDidChangeEmitter = new vscode.EventEmitter<vscode.Uri>();
  onDidChange = this.onDidChangeEmitter.event;

  async createDocument(
    uri: vscode.Uri,
    content?: string,
    options?: vscode.TextDocumentShowOptions & { updateOnly?: boolean }
  ) {
    this.content = content || "";
    this.onDidChangeEmitter.fire(uri);
    if (!options?.updateOnly) {
      let doc = await vscode.workspace.openTextDocument(uri);
      await vscode.window.showTextDocument(doc, { preview: false, ...options });
    }
  }

  getUri(title: string) {
    return vscode.Uri.parse(`${this.uriScheme}:${title}`);
  }
}
