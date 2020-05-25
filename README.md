# IJ2TPL.js
Mustache-like Template Engine for Javascript(Only 3kB).

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

**NOTICE：** DO NOT use comment on same line, it doesn't looks like what you want!

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

**Custom Prefix and Suffix(aka Delimiter or Tags)**
```js
IJ2TPL.parse('Hello <%name%>', '<%', '%>');
```

**Not Implemented Yet:**
- ~~Function type(Supported on v0.0.2-dev)~~
- Sub-template(aka Partial Section)
- Format Pipe(aka Filter)

Last update: 2020-05-18
