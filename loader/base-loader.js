"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
exports.__esModule = true;
exports.IJ2BaseLoader = exports.escapeString = void 0;
var fs = __importStar(require("fs"));
var path = __importStar(require("path"));
// XXX: help me to make it better!
function escapeString(string_) {
    return JSON.stringify(string_);
}
exports.escapeString = escapeString;
var IJ2BaseLoader = /** @class */ (function () {
    function IJ2BaseLoader(basePath) {
        if (basePath === void 0) { basePath = '.'; }
        this.basePath = basePath;
    }
    IJ2BaseLoader.prototype.load = function (path_) {
        if (!path.isAbsolute(path_))
            path_ = path.resolve(path.join(this.basePath, path_));
        var source = fs.readFileSync(path_, 'utf-8');
        return escapeString(source);
    };
    return IJ2BaseLoader;
}());
exports.IJ2BaseLoader = IJ2BaseLoader;
