# IJ2TPL.js
TypeScript 编写的类 Mustache 模板引擎(uglify后 <= 4kB)。

> 比Mustache.js更快（至少不会更慢）！

[English(Waiting to update)](./README.en.md) | 中文

**已支持**
- ES3(>=IE6)

注：gh-page 的测试模板是可以在 IE6 下正常渲染的，所以理论上是支持
所有2000年之后的浏览器的。

## 使用方法

**注意**：本文里混用“{{xxx}}”与“{xxx}”标签风格，但实际上 IJ2TPL.js
默认是“{xxx}”风格标签，实际使用时注意自行切换。

**TypeScript(ES6)**：
```ts
import * as IJ2TPL from './ij2tpl';

// 解析一个模板
let renderer = IJ2TPL.parse(`你好，{name}`);

// 然后让我们来渲染它！
renderer.render({{name: 'IJ2TPL'}}); // -> "你好，IJ2TPL!"
```

**NodeJS**：
```js
const IJ2TPL = require('./dist/ij2tpl.min');

// 解析一个模板
let renderer = IJ2TPL.parse('你好, {name}!');

// 然后让我们来渲染它！
renderer.render({name: 'IJ2TPL'}); // -> "你好, IJ2TPL!"
```

### 注释

```html
{- 一条注释 }
{-- 另一条注释 }
{-- 还是一条注释 --}

{-- 错误! }--}
```

如你所见，IJ2TPL.js 中的注释是以`prefix + '-' + suffix`形式组成的，
本质上它是一个标签的变种，解析器在解析时匹配到`suffix`后便将该标签忽略了。

除了注释之外，其还能用于控制单行的缩进。比如我们想让某一行渲染的内容
不受其在源码中的缩进的影响，如下：
```ij2
    {-}Hello {name}
{-  ^^^ 输出的结果是：“Hello xxx”  }
```
```js
template.render({name: "chen"}); // -> "Hello chen"
```

这个特性在旧版本中被叫做“行起始符号”。

学过正则表达式的小伙伴可能会觉得有点耳熟，这个符号就有点类似于“^”，
但只能用于消除单行左侧的缩进。

### If 段落

```html
{?valid}
	仅在数据合法时渲染。
{/valid}
```

If段落将会判断变量的真假，然后再将其作为新的上下文对段落进行渲染。
变量的真假与大多数类C语言类似，但需要注意，IJ2TPL.js 中的空数组是
假值。  

空数组在 JavaScript 中判断为真这确实不是一个bug。但是作为轻逻辑类型
的模板引擎，我们大多数时候是希望将空数组作为假值来处理的。

值得一提的是 IJ2TPL.js(以及Mustache.js) 中的段落不光是作为一种判断存在
的，其也可以作为一种遍历。如果变量是一个数组，那么段落会对其进行一次遍历
，段落代码中的“.”变量奖会引用到每一次被遍历出来的值。  

如`{{?numbers}}{{.}}\n{{/numbers}}`就是对变量`numbers`的遍历。现在我
们用这个模板来渲染一个数组，如下所示：
```ts
let template = parse('{{?numbers}}{{.}}\n{{/numbers}}');
template.render({numbers: [1, 2, 3, 4]}); // -> "1\n2\n3\n\4\n"
```

这里我们讲到了一个名为“.”的变量，这个变量是对当前上下文的引用。

我们可以使用这个特性对上面的模板进行修改，使其变成下面的格式：
```ts
let template = parse('{{?.}}{{.}}\n{{/.}}');
template.render([1, 2, 3, 4]); // -> "1\n2\n3\n\4\n"
```

更高级的使用方法可以参考下面“嵌套段落”章节。

### Not 段落

```html
{!valid}
	仅在数据非法时渲染。
{/valid}
```

Not段落与If段落是类似的，只不过其会在变量值为假时渲染。

因为段落只有在假时被渲染，所以其也不可能像If段落那样对变量进行一次
遍历。这是理所当然的。但不用担心，内部嵌套的If段落并不会被影响到。

如：
```ij2
{{!valid}}
	{{?errors}}
		{{-}} error: {{.}}
	{{/errors}}
{{/valid}}
```

详情可以参考下面“嵌套段落”章节。

### Raw 格式化器

```html
{-- name = '<b>urain39</b>' --}
你好 {#name}
```

Raw格式化器是格式化器中的一种。

我们之前在上面看到的问候模板中的`{{name}}`便是一个格式化器，
其作用是在给出的视图数据中将与之对应的内容展示出来。

普通的格式化器是会被内部的转义函数转义的，以确保内容足够安全，
但这可能会造成渲染的结果并非是你想要的。

这时你就需要使用到Raw格式化器了。

使用方法与其他格式化器一样，你只需要在普通格式化器前加上一个“#”
号就行了。

```ts
let template = parse('<div>{#source}<div>');

template.render({source: '<p>Hello World!</p>'});
```

当然，如果你觉得这样非常麻烦，那么你也可以修改转义函数：
```js
import { setEscapeFunction } from './ij2tpl';

// 使其原封不动的返回
setEscapFunction(v => v);
```

不过这样会影响到整个 IJ2TPL.js 的模板。如果你有多个模板，我们一般
是不建议你这样做的。

### If-Else 段落

```html
{?valid}
	数据合法。
{*valid}
	哎呀，好像出错了？
{/valid}
```

If-Else段落是一种语法糖。它可以将同一个变量的If段落和Not段落合并
成一个段落。两个分支之间使用“{*xxx}”格式分隔开。

题外话：为什么没有Not-Else段落呢？
> 是无法实现吗？不是的。虽然没有实际去写过，但就从实现上来说并不难。
> 我当初在设计时考虑到这样的语法会相对难理解，至少我不喜欢这样的语法。
> 加之我们的语法主要以符号为主，如果再增加上这样一种取反语法，那对于
> 用户来说，可读性降低了可不是一点两点……

### 函数类型（Lambda）

```ts
function toHumanReadableSize(size: number): string {
	var i = 0,
	dataUnits = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB', 'BiB', 'NiB', 'DiB'];

	while (size >= 1024)
		i++, size /= 1024;

	return String(size.toFixed(2)) + dataUnits[i];
}

import { Context, Name } from './ij2tpl';

/* 你可以理解为这是一个属性 getter，与其他格式化器相同 */
function humanReadableSize(context: Context) {
	const name: Name = ['downloadedSize', null, null]; 

	let downloadedSize = context.resolve(name);

	return toHumanReadableSize(downloadedSize);
}
```

```html
已下载 {humanReadableSize}
```

函数类型指的是通过上下文查找到的变量是可调用类型的格式化器。

一般而言我们是不需要使用到函数类型的。但是如果你遇到了足够复杂的场景，
如我们需要验证某个值的范围是否正常，然后再决定是否渲染时，函数类型就
显得非常重要了。

函数类型中的函数会接受一个`Context`变量，你可以通过这个变量查找你想要的值。

如最上面我们见到的示例一样。

我们可以看到在上面的源码里我们还导入了一个叫做`Name`的类型，这个
类型是从`v0.1.0`时引入的。

```ts
import { Context, Name } from './ij2tpl';
```

其源码定义是：
```ts
//                  NAME    NAMES            FILTERS          IS_ACTION
export type Name = [string, string[] | null, string[] | null, boolean];
```

因为篇幅原因，我不打算做过多的解释。我们只需要关心前两个元素的类型。

其中`NAME`表示的是一个格式化器的全名，如`"obj.key1.key2"`。后面的`NAMES`表示的是分隔
以后的名字，如`["obj", "key1", "key2"]`。如果名称不包含属性，那么后面的`NAMES`属性则
需要设置为`null`。
```js
// 包含属性
let name1: Name = ['name.lastName', ['name', 'lastName']];

// 不包含属性
let name2: Name = ['name', null];
```

这样设计的原因是为了优化查找速度。但相对的也给开发者造成了一定程度的不便。

**注意**：这里的函数类型会缓存结果，如果这不是你想要的效果，那么你可以考虑下面的过滤器。

### 定制 前缀 与 后缀 （分隔符）

```js
IJ2TPL.parse('Hello <%name%>', '<%', '%>');
```

```ts
let template = IJ2TPL.parse('Hello ${name}', '${', '}');

template.render({name: 'urain39'}); // -> 'Hello urain39'
```

此处应该没有什么特别需要讲解的，所以就举一两个简单的例子一笔带过了。

> 前缀可以是特殊字符，如上面讲到过的“#”，但是后缀不能是特殊字符。
> 因为这样会让词法分析函数产生误解，让结果不可预料。

### 片段模板（v0.1.0+）

```html
{? xxxEnabled }
	{@partial_template}
{/ xxxEnabled }
```

```js
let renderer = IJ2TPL.parse(`  {@partial_template}`),
	renderer2 = IJ2TPL.parse(source2);

let partialMap = {
		partial_template: renderer2
	};

renderer.render(data, partialMap);
```

片段模板是指在模板中以“{@xxx}”形式引入的另一个模板。

`Renderer.render`方法接受两个参数，其中除了必要的视图数据`data`外，
还有一个可选的叫做`partialMap`的参数。这个参数的类型是`IMap<Renderer>`。
```ts
  public render(data: IMap<any>, partialMap?: IMap<Renderer>): string {
    return this.renderTree(
      this.treeRoot, new Context(data, null), partialMap
	);
```

也就是说我们只需要将被引用的模板作为`Map`传给`Renderer.render`方法即可。

有意思的是，如果我们将模板本身作为参数传入给`Render.render`，那么我们甚至
可以实现递归渲染，参考：https://stackoverflow.com/questions/13408425/mustache-js-recursion

从`v0.1.3`开始，IJ2TPL.js 和 Mustache.js 一样，已经支持缩进片段模板了。

片段模板将会以“{@xxx}”标签的缩进为准，将渲染后的片段模板以行为单位重新进行缩进。

**关于缩进的小问题**
> 目前我们的缩进检测机制还有些小问题，会误认为上一个字符标签的空白部分是一个
> 单独行的开始部分，即缩进。因此我建议片段模板最好还是单行使用为好。不过不用
> 担心，稍后的版本中我会改进这个问题。

### 过滤器 与 动作（Action）（v0.1.0+）

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

这和许多框架中的过滤器或是Unix Shell中的管道是一样的。

不过需要注意一点，IJ2TPL.js 中的过滤器是闭包保存的，一旦加载后
则是多个引用共享一个变量。我不保证所谓的安全克隆后的对象的安全性。

*动作*与过滤器基本是一样的, 但是其并不会查找字段(因为“没名字”)
```html
{- 简单的例子 -}
{| report}
```

```js
IJ2TPL.setFilterMap({
	report: function() {
		// ...		
		return ''; // 不添加任何内容
	}
});
```

还记得我们上面提过的函数类型吗？这里的*动作*类型就类似于函数类型。

只不过它并不会缓存结果，适合对数据实时性要求比较高的场合使用。

**关于参数**
> 没有名字的过滤器组合当然也就没有参数。这或许是一个问题，
> 但我们目前并不考虑解决这个问题。

### 函数类型 与 动作类型 的不同点

|比较|函数类型|动作类型|
|:---:|:----:|:------:|
| 实时 | No  | Yes |
| 安全 | Yes | No  |
| 效率 | Yes | No  |
| 易用 | Yes | No  |

这两个功能各有优缺点，上图只是一个简单的比较，不能随便下定论。

简单而言，函数类型会在单页渲染时缓存第一次的结果，后面的渲染都是引用。
而动作类型会对每一次渲染重新求值，相对来说更实时一些。

### 嵌套段落

```html
{?valid}
	{-}你的得分：
	{?scores}
		{-}得分：{.}
	{/scores}
{/valid}
```

段落相当于是一个子模板，如果模板中能够定义模板，那么段落中
能定义新的段落吗？答案是当然可以，这就是所谓的嵌套。

**注意**：上面我们提到过了，每个段落相当于新的环境，所以在编写
模板时一定要注意名字是否写对了，然后再使用。
> If段落将会判断变量的真假，然后再将其作为新的上下文对段落进行渲染

下面是一个稍复杂的示例：
```js
let template = IJ2TPL.parse(`\
{?settings}
	{?account}
		{?username}{username}{/username}
		{?password}{password}{/password}
	{/account}
{/settings}
`);

template.render({
	settings: {
		account: {
			username: "urain39",
			password: "123"
		}
	}
});
```
这个功能有点类似于`with`语法，写起来会更便捷。

如果你真的运行了上面的代码，那么你会发现上面的渲染结果并非
你想的那样，这是为什么呢？

其实这是因为我们的`tokenize`函数会将段落标签的换行符和缩进都
忽略掉造成的。所以上面的模板应该改成：
```ij2
{?settings}
	{?account}
		{?username}
			{username}
		{/username}
		{?password}
			{password}
		{/password}
	{/account}
{/settings}
```

### 自递归模板（v0.1.3+）

自递归模板是从`v0.1.3`引入的新概念，其主要功能是让模板支持
递归渲染。

在上面我们给出了一个 Mustache.js 递归的实现，这个功能在 IJ2TPL.js
中被简化为你可以使用“@&”表示引用自身：
```ts
let template = IJ2TPL.parse(`\
{?contents}
    {-}类型：{type}
    {-}名称：{name}
    {-}{@&}
{/contents}
`);

let data = {
	"contents": [
		{
			"type": "file",
            "name": "file1",
            "contents": null
		},
		{
			"type": "directory",
			"name": "directory1",
			"contents": [
				{
					"type": "file",
                    "name": "file2",
                    "contents": null
				}
			]
		}
	]
};

expected(template.render(data), `\
类型：file
名称：file1
类型：directory
名称：directory1
类型：file
名称：file2
`);
```

但是如你所见，我们在渲染时必须规定数据中含有一个“null”作为递归的
终结符号，这或许对我们引用第三方数据来说非常不便。

为了应对这种复杂的情况，我们也增加一种相对独立的递归形式“@^”：
```js
let template = IJ2TPL.parse(`\
{?contents}
    类型：{type}
    名称：{name}
    {@^}
{/contents}
`);

let data = {
	"contents": [
		{
			"type": "file",
			"name": "file1"
		},
		{
			"type": "directory",
			"name": "directory1",
			"contents": [
				{
					"type": "file",
					"name": "file2"
				}
			]
		}
	]
};

expected(template.render(data), `\
    类型：file
    名称：file1
    类型：directory
    名称：directory1
        类型：file
        名称：file2
`);
```

这样我们就省去了手动加上`null`终结递归的操作了。

这部分的代码：
```ts
        if (value === '&') { // Recursive render with parents
          buffer += this.renderTree(this.treeRoot, context, partialMap)
            .replace(BEGINNING_RE, `${indentation}$&`);
        } else if (value === '^') { // Recursive render without parents
          buffer += this.renderTree(this.treeRoot, new Context(context.data, null), partialMap)
			.replace(BEGINNING_RE, `${indentation}$&`);
```

你可以看见，这里我们其实是将`context`的数据重新包装了一次，然后将其`parent`设置为`null`。
这样设计我们就不会将上层作用域的变量与当前作用域的变量搞混了。

## 关于调试

抱歉，我没有考虑到这一点。 为了改进令牌化(tokenizing)速度，我将位置信息移除了。
不过你依然可以从错误信息中猜测是哪里出了问题，它会告诉你段落的名字与类型。

## 还未实现

- ~~函数类型(已在 v0.0.2-dev 支持)~~
- ~~子模板(Partial Section)~~
- ~~格式化管道(又叫做过滤器)~~

## 关于自述文件

写错了 / 不能理解？请帮助我改进！
你只需在我的项目主页打开一个新的 issue 或者 PR ，我会尽可能的回复的 :)

上次更新: 2021-01-04
