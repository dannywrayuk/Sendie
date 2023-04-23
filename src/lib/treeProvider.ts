import * as vscode from "vscode";

export type ExtendedTreeItem = vscode.TreeItem & {
  children?: ExtendedTreeItem[];
  meta?: any;
};

export class TreeProvider implements vscode.TreeDataProvider<ExtendedTreeItem> {
  private treeItems: ExtendedTreeItem[] = [];
  private constructTree: () =>
    | ExtendedTreeItem[]
    | Promise<ExtendedTreeItem[] | undefined>;
  constructor(
    constructTree: () =>
      | ExtendedTreeItem[]
      | Promise<ExtendedTreeItem[] | undefined>
  ) {
    this.constructTree = constructTree;
    this.refresh();
  }

  getTreeItem(element: ExtendedTreeItem): ExtendedTreeItem {
    return element;
  }

  getChildren(element?: ExtendedTreeItem): Thenable<ExtendedTreeItem[]> {
    if (!element) {
      return Promise.resolve(this.treeItems);
    }
    if (element.children) {
      return Promise.resolve(element.children);
    }
    return Promise.resolve([]);
  }

  private changeEvent = new vscode.EventEmitter<void>();
  public get onDidChangeTreeData(): vscode.Event<void> {
    return this.changeEvent.event;
  }

  async refresh() {
    this.treeItems = (await this.constructTree()) || [];
    this.changeEvent.fire();
  }
}
