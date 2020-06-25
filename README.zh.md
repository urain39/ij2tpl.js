# IJ2TPL.js
TypeScript 编写的类 Mustache 模板引擎(uglify后 <= 3kB)。

> 比Mustache.js更快(至少不会更慢)！

[English](./README.md) | [中文](./README.zh.md)

**使用方法:**
```js
// 导入ij2tpl.js, 例如nodejs:
const IJ2TPL = require('./dist/ij2tpl.min');

// 解析一个模板
let renderer = IJ2TPL.parse('你好, {name}!');

// 然后让我们来渲染它！
renderer.render({name: 'IJ2TPL'}); // -> "你好, IJ2TPL!"
```

**注释**
```html
{- 一条注释 }
{-- 另一条注释 }
{-- 还是一条注释 --}

{-- 错误! }--}
```

**If 段落**
```html
{?valid}
	只渲染合法的数据。
{/valid}
```

**Not 段落**
```html
{!valid}
	只渲染非法的数据。
{/valid}
```

**Raw 格式化器**
```html
{-- name = '<b>urain39</b>' --}
你好 {#name}
```

**If-Else 段落**

```html
{?valid}
	仅合法的数据才能被渲染。
{*valid}
	哎呀，好像出错了？
{/valid}
```

**函数类型(格式化器)**
```js
function toHumanReadableSize(size) {
	var i = 0,
	dataUnits = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB', 'BiB', 'NiB', 'DiB'];

	while (size >= 1024)
		i++, size /= 1024;

	return String(size.toFixed(2)) + dataUnits[i];
}

/* 你可以理解为这是一个属性 getter，与其他格式化器相同 */
function humanReadableSize(context) {
	var downloadedSize = context.resolve('downloadedSize');
	return toHumanReadableSize(downloadedSize);
}
```

```html
已下载 {humanReadableSize}
```

**行起始标记(LBM)**
```html
{-- 我们的 `tokenize` 实现允许你在某个缩进的末尾使用
	一个空注释表示你想要在这一行中去除缩进。

	参考 https://github.com/urain39/ij2tpl.js/issues/70
	--}

{-- 示例： --}
Hello World
	{-}Hello Wolrd

{-- 上面的两个 hello-world 是相同的。 }
```

**定制 Prefix 与 Suffix(又叫做分隔符)**
```js
IJ2TPL.parse('Hello <%name%>', '<%', '%>');
```

**片段模板(v0.1.0 已添加)**
```html
{? xxxEnabled }
	{@partial_template}
{/ xxxEnabled }
```

```js
let renderer = IJ2TPL.parse(source),
	renderer2 = IJ2TPL.parse(source2),
	partialMap = {
		partial_template: renderer2
	};

renderer.render(data, partialMap);
```

**过滤器 与 动词(Action names)(v0.1.0 已添加)**
```html
Hello { name | no-f-word }
```

```js
IJ2TPL.setFilterMap({
	'no-f-word': function(word) {
		return word.replace('fuck', '****');
	}
});
```

*动词* 与 过滤器 是一样的, 但是其并不会查找字段(因为“没名字”)
```html
{- 简单的例子 -}
{| report}
```

或者：
```html
{do | refresh}
```

**`Function type`与`Action names`的不同点**

`Function type`每次都会查找字段(name), 但是`Action name`不会。

**还未实现:**
- ~~函数类型(已在 v0.0.2-dev 支持)~~
- ~~子模板(Partial Section)~~
- ~~格式化管道(又叫做过滤器)~~

上次更新: 2020-06-25
