import * as vscode from "vscode";

export class VirtualDocumentProvider
  implements vscode.TextDocumentContentProvider
{
  private content: string = "";
  provideTextDocumentContent(uri: vscode.Uri): string {
    return this.content;
  }

  setContent(content: string): void {
    this.content = content;
  }
}
