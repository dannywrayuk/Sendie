import * as vscode from "vscode";

export interface SendieTreeItem extends vscode.TreeItem {
  children?: SendieTreeItem[];
  path?: string;
  indexArray?: number[];
}

type TreeConstructor = (root: string) => SendieTreeItem[];

export class TreeProvider implements vscode.TreeDataProvider<SendieTreeItem> {
  private requestTreeItems: SendieTreeItem[] = [];
  constructor(private workspaceRoot: string, constructTree: TreeConstructor) {
    this.requestTreeItems = constructTree(this.workspaceRoot);
  }

  getTreeItem(element: SendieTreeItem): SendieTreeItem {
    return element;
  }

  getChildren(element?: SendieTreeItem): Thenable<SendieTreeItem[]> {
    if (!this.workspaceRoot) {
      return Promise.resolve([]);
    }
    if (!element) {
      return Promise.resolve(this.requestTreeItems);
    }
    if (element.children) {
      return Promise.resolve(element.children);
    }
    return Promise.resolve([]);
  }
}
