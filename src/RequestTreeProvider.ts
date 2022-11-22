import * as vscode from "vscode";
import { constructRequestTree } from "./constructRequestTree";

export class RequestTreeProvider implements vscode.TreeDataProvider<any> {
  private requestTree: any = [];
  constructor(private workspaceRoot: string) {
    this.requestTree = constructRequestTree(this.workspaceRoot);
    console.log(this.requestTree);
  }

  getTreeItem(element: any): vscode.TreeItem {
    return element;
  }

  getChildren(element?: any): Thenable<any[]> {
    if (!this.workspaceRoot) {
      vscode.window.showInformationMessage("No dependency in empty workspace");
      return Promise.resolve([]);
    }

    if (!element) {
      return Promise.resolve(this.requestTree);
    }
    if (element.children) {
      return Promise.resolve(element.children);
    }
    return Promise.resolve([]);
  }
}
