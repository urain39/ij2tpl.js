# ij2tpl.js
Mustache-like Template for Javascript.

**Usage:**
```js
// import ij2tpl.js, for example nodejs:
const IJ2TPL = require('./dist/ij2tpl.min.js');

// Parse a template source
let renderer = IJ2TPL.parse('Hello, {name}!');


// Then let's render it!
renderer.render({name: 'IJ2TPL'}); // -> "Hello, IJ2TPL"
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

**If-Else Section(Feature)**
```html
{?valid}
	only valid data can be rendered.
{*valid}
	Oops, something wrong?
{/valid}
```

**Not Implemented Yet:**
- Function type
- Format pipe(filter)

Last update: 2019-12-08

