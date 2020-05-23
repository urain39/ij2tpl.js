import * as fs from 'fs';
import * as path from 'path';

export class IJ2BaseLoader {
	private basePath: string;

	public constructor(basePath: string = '.') {
		this.basePath = basePath;
	}

	public load(path_: string): string {
		if (!path.isAbsolute(path_))
			path_ = path.resolve(path.join(this.basePath, path_));

		let source: string = fs.readFileSync(path_, 'utf-8');

		return source;
	}
}