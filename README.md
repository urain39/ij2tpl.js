# IJ2TPL.js
A Mustache-like Template Engine written in TypeScript(<= 5kB after uglifying).

> Faster than Mustache.js(at least not slower)!

[English](./README.md) | [中文](./README.zh.md)

**Usage:**
```js
// Import ij2tpl.js, for example nodejs:
const IJ2TPL = require('./dist/ij2tpl.min');

// Parse a template source
let renderer = IJ2TPL.parse('Hello, {name}!');

// Then let's render it!
renderer.render({name: 'IJ2TPL'}); // -> "Hello, IJ2TPL!"
```

**Comments**
```html
{- A comment }
{-- A comment too }
{-- Yet another comment --}

{-- Error! }--}
```

**If Section**
```html
{?valid}
	Only valid data can be rendered.
{/valid}
```

**Not Section**
```html
{!valid}
	Only invalid data can be rendered.
{/valid}
```

**Raw Formatter**
```html
{-- name = '<b>urain39</b>' --}
Hello {#name}
```

**If-Else Section**

```html
{?valid}
	Only valid data can be rendered.
{*valid}
	Oops, something's wrong?
{/valid}
```

**Function type(Formatter)**
```js
function toHumanReadableSize(size) {
	var i = 0,
	dataUnits = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB', 'BiB', 'NiB', 'DiB'];

	while (size >= 1024)
		i++, size /= 1024;

	return String(size.toFixed(2)) + dataUnits[i];
}

/* You can think it is a property getter, same as other formatters */
function humanReadableSize(context) {
	var downloadedSize = context.resolve('downloadedSize');
	return toHumanReadableSize(downloadedSize);
}
```

```html
Downloaded {humanReadableSize}
```

**Line Begin Mark(LBM)**
```html
{-- Our `tokenize` implementation allows you to use a
	empty comment at the end of indentation to indicate
	you want to strip indentation for a signe-line.

	See https://github.com/urain39/ij2tpl.js/issues/70
	--}

{-- For example: --}
Hello World
	{-}Hello Wolrd

{-- The above two hello-world are same. }
```

**Custom Prefix and Suffix(aka Delimiter or Tags)**
```js
IJ2TPL.parse('Hello <%name%>', '<%', '%>');
```

**Partial Template(v0.1.0 added)**
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

**Filters and Action names(v0.1.0 added)**
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

*Action name* same as filters, but it has no name to look up!
```html
{- Simply -}
{| report}
```

Or:
```html
{do | refresh}
```

**Differences between `Function type` and `Action names`**

`Function type` will always cache look up results, but `Action name` not.

**Not Implemented Yet:**
- ~~Function type(Supported on v0.0.2-dev)~~
- ~~Sub-template(aka Partial Section)~~
- ~~Format Pipe(aka Filter)~~

Last update: 2020-06-12
