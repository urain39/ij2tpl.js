var Context = (function () {
    function Context(data) {
        this.cache = [];
    }
    Context.prototype.lookup = function (name) {
    };
    return Context;
}());
export { Context };
var Renderer = (function () {
    function Renderer(treeRoot) {
        this.treeRoot = treeRoot;
    }
    return Renderer;
}());
export { Renderer };
