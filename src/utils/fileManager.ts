import fs from 'fs-extra';
import path from 'path';

export async function createFile(filePath: string, content: string) {
  await fs.ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, content);
}

export async function fileExists(filePath: string): Promise<boolean> {
  return fs.pathExists(filePath);
}