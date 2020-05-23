import * as fs from 'fs';
import * as path from 'path';
var IJ2BaseLoader = /** @class */ (function () {
    function IJ2BaseLoader(basePath) {
        if (basePath === void 0) { basePath = '.'; }
        this.basePath = basePath;
    }
    IJ2BaseLoader.prototype.load = function (path_) {
        if (!path.isAbsolute(path_))
            path_ = path.resolve(path.join(this.basePath, path_));
        var source = fs.readFileSync(path_, 'utf-8');
        return source;
    };
    return IJ2BaseLoader;
}());
export { IJ2BaseLoader };
