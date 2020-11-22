# IJ2TPL.js
TypeScript 编写的类 Mustache 模板引擎(uglify后 <= 4kB)。

> 比Mustache.js更快(至少不会更慢)！

[English](./README.md) | 中文

**已支持**
- ES3(>=IE6)

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
	仅在数据合法时渲染。
{/valid}
```

**Not 段落**
```html
{!valid}
	仅在数据非法时渲染。
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
	数据合法。
{*valid}
	哎呀，好像出错了？
{/valid}
```

**函数类型(Lambda)**
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
	var downloadedSize = context.resolve(['downloadedSize', null, null]);
	return toHumanReadableSize(downloadedSize);
}
```

```html
已下载 {humanReadableSize}
```

**行起始标记(去缩进)**
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

**定制 前缀 与 后缀(分隔符)**
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

**过滤器 与 动作(Actions)(v0.1.0 已添加)**
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

*动作* 与 过滤器 是一样的, 但是其并不会查找字段(因为“没名字”)
```html
{- 简单的例子 -}
{| report}
```

**`Function type`与`Actions`的不同点**

`Function type`每次都会查找字段(name), 但是`Action`不会。

**复杂的Section(嵌套)**
```html
{?valid}
	{-}你的得分：
	{?scores}
		{-}得分：{.}
	{/scores}
{/valid}
```

**关于调试**

抱歉，我没有考虑到这一点。 为了改进令牌化(tokenizing)速度，我将位置信息移除了。
不过你依然可以从错误信息中猜测是哪里出了问题，它会告诉你 Section 的名字与类型。

**还未实现:**
- ~~函数类型(已在 v0.0.2-dev 支持)~~
- ~~子模板(Partial Section)~~
- ~~格式化管道(又叫做过滤器)~~

**关于自述文件**

写错了 / 不能理解？请帮助我改进！
你只需在我的项目主页打开一个新的 issue 或者 PR ，我会尽可能的回复的 :)

上次更新: 2020-06-27
