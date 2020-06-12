import * as fs from 'fs';
import * as path from 'path';

export class IJ2BaseLoaderError extends Error {}

export class IJ2BaseLoader {
	private basePath: string;

	public constructor(basePath: string = '.') {
		this.basePath = basePath;
	}

	public isValidFilename(filename: string): boolean {
		return filename.split('.').slice(-2).indexOf('ij2') !== -1;
	}

	public loadFile(path_: string): string {
		if (!path.isAbsolute(path_))
			path_ = path.resolve(path.join(this.basePath, path_));

		if (!this.isValidFilename(path_))
			throw new IJ2BaseLoaderError(`Invalid filename '${path_}'!`);

		let source: string = fs.readFileSync(path_, 'utf-8');

		return source;
	}
}