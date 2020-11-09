var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import * as fs from 'fs';
import * as path from 'path';
var IJ2BaseLoaderError = /** @class */ (function (_super) {
    __extends(IJ2BaseLoaderError, _super);
    function IJ2BaseLoaderError() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return IJ2BaseLoaderError;
}(Error));
export { IJ2BaseLoaderError };
var IJ2BaseLoader = /** @class */ (function () {
    function IJ2BaseLoader(basePath) {
        if (basePath === void 0) { basePath = '.'; }
        this.basePath = basePath;
    }
    IJ2BaseLoader.prototype.isValidFileName = function (fileName) {
        return !!~fileName.split('.').slice(-2).indexOf('ij2');
    };
    IJ2BaseLoader.prototype.loadFile = function (path_) {
        if (!path.isAbsolute(path_))
            path_ = path.resolve(path.join(this.basePath, path_));
        if (!this.isValidFileName(path_))
            throw new IJ2BaseLoaderError("Invalid fileName '" + path_ + "'!");
        var source = fs.readFileSync(path_, 'utf-8');
        return source;
    };
    return IJ2BaseLoader;
}());
export { IJ2BaseLoader };
