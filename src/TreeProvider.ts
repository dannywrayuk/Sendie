import * as vscode from "vscode";

export interface ExtendedTreeItem extends vscode.TreeItem {
  children?: ExtendedTreeItem[];
}

export class TreeProvider implements vscode.TreeDataProvider<ExtendedTreeItem> {
  private requestTreeItems: ExtendedTreeItem[] = [];
  private constructTree: () => ExtendedTreeItem[];
  constructor(constructTree: () => ExtendedTreeItem[]) {
    this.constructTree = constructTree;
    this.requestTreeItems = this.constructTree();
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

  public get onDidChangeTreeData(): vscode.Event<void> {
    return this.changeEvent.event;
  }

  private changeEvent = new vscode.EventEmitter<void>();
  refresh() {
    this.requestTreeItems = this.constructTree();
    this.changeEvent.fire();
  }
}
