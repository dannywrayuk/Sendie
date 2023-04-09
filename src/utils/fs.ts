import * as vscode from "vscode";
import * as fs from "fs";

export const getFile = (file: vscode.Uri) => {
  if (file.scheme !== "file") return;
  try {
    const data = fs.readFileSync(file.fsPath).toString();
    return data;
  } catch (e) {}
  return;
};
