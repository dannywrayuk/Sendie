import * as vscode from "vscode";
import { constructTree } from "./constructTree";

export class RequestTreeProvider implements vscode.TreeDataProvider<any> {
  constructor(private workspaceRoot: string) {}

  getTreeItem(element: any): vscode.TreeItem {
    return element;
  }

  getChildren(element?: any): Thenable<any[]> {
    if (!this.workspaceRoot) {
      vscode.window.showInformationMessage("No dependency in empty workspace");
      return Promise.resolve([]);
    }

    let fileTree = [];
    if (!element) {
      fileTree = constructTree(this.workspaceRoot);
    } else if (element.children) {
      fileTree = element.children;
    }

    return Promise.resolve(
      fileTree.map((x: any) => {
        if (x.children) {
          return {
            label: x.id,
            path: x.path,
            collapsibleState: true,
            contextValue: "folder",
            children: x.children,
          };
        } else {
          return {
            label: x.id,
            path: x.path,
          };
        }
      })
    );
  }
}
