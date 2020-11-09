import * as fs from 'fs';
import * as path from 'path';

export class IJ2BaseLoaderError extends Error {}

export class IJ2BaseLoader {
  private basePath: string;

  public constructor(basePath: string = '.') {
    this.basePath = basePath;
  }

  public isValidFileName(fileName: string): boolean {
    return !!~fileName.split('.').slice(-2).indexOf('ij2');
  }

  public loadFile(path_: string): string {
    if (!path.isAbsolute(path_))
      path_ = path.resolve(path.join(this.basePath, path_));

    if (!this.isValidFileName(path_))
      throw new IJ2BaseLoaderError(`Invalid fileName '${path_}'!`);

    const source: string = fs.readFileSync(path_, 'utf-8');

    return source;
  }
}