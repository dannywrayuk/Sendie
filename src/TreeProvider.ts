import * as vscode from "vscode";

export interface ExtendedTreeItem extends vscode.TreeItem {
  children?: ExtendedTreeItem[];
}

export class TreeProvider implements vscode.TreeDataProvider<ExtendedTreeItem> {
  private requestTreeItems: ExtendedTreeItem[] = [];
  constructor(constructTree: () => ExtendedTreeItem[]) {
    this.requestTreeItems = constructTree();
  }

  getTreeItem(element: ExtendedTreeItem): ExtendedTreeItem {
    return element;
  }

  getChildren(element?: ExtendedTreeItem): Thenable<ExtendedTreeItem[]> {
    if (!element) {
      return Promise.resolve(this.requestTreeItems);
    }
    if (element.children) {
      return Promise.resolve(element.children);
    }
    return Promise.resolve([]);
  }
}
