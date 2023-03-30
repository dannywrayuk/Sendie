import * as vscode from "vscode";

export const findFileInTabs = (fileUri: vscode.Uri) => {
  const foundTabs: vscode.Tab[] = [];
  vscode.window.tabGroups.all.forEach((tabGroup) => {
    tabGroup.tabs.forEach((tab) => {
      const tabUri = (tab.input as { uri: vscode.Uri })?.uri;
      if (tabUri && tabUri.path === fileUri.path) {
        foundTabs.push(tab);
      }
    });
  });
  return foundTabs;
};
