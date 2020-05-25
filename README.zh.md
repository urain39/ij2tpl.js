# IJ2TPL.js
JavaScript 编写的类 Mustache 模板引擎(仅 3kB).

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

**注意：** 请勿在同一行上使用注释，否则渲染结果可能会有误。

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

**定制 Prefix 与 Suffix(又叫做分隔符)**
```js
IJ2TPL.parse('Hello <%name%>', '<%', '%>');
```

**还未实现:**
- ~~函数类型(已在 v0.0.2-dev 支持)~~
- 子模板(Partial Section)
- 格式化管道(又叫做过滤器)

上次更新: 2020-05-18
