# ij2tpl.js
Mustache-like Template for Javascript(Only 3kB!).

**Usage:**
```js
// import ij2tpl.js, for example nodejs:
const IJ2TPL = require('./dist/ij2tpl.min.js');

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
	only valid data can be rendered.
{/valid}
```

**Not Section**
```html
{!valid}
	only invalid data can be rendered.
{/valid}
```

**Raw Formatter**
```html
{-- name = '<b>urain39</b>' --}
Hello {#name}
```

<details>
<summary><del> **If-Else Section(Re-Working)** </del></summary>

```html
{?valid}
	only valid data can be rendered.
{*valid}
	Oops, something's wrong?
{/valid}
```

</details>


**Function type**
```js
function toHumanReadableSize(size) {
	var i = 0,
	dataUnits = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB', 'BiB', 'NiB', 'DiB'];

	while (size >= 1024)
		i++, size /= 1024;

	return String(size.toFixed(2)) + dataUnits[i];
}

function humanReadableSize(context) {
	var downloadedSize = context.resolve('downloadedSize');
	return toHumanReadableSize(downloadedSize);
}
```

**Not Implemented Yet:**
- ~~Function type(Supported on v0.0.2-dev)~~
- Format pipe(Filter)

Last update: 2020-05-14
