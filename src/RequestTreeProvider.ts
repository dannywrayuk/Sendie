import * as vscode from "vscode";
import { constructRequestTree } from "./constructRequestTree";

export interface RequestTreeItem extends vscode.TreeItem {
  children?: RequestTreeItem[];
  path?: string;
  indexArray?: number[];
}

export class RequestTreeProvider
  implements vscode.TreeDataProvider<RequestTreeItem>
{
  private requestTreeItems: RequestTreeItem[] = [];
  constructor(private workspaceRoot: string) {
    this.requestTreeItems = constructRequestTree(this.workspaceRoot);
  }

  getTreeItem(element: RequestTreeItem): RequestTreeItem {
    return element;
  }

  getChildren(element?: RequestTreeItem): Thenable<RequestTreeItem[]> {
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
