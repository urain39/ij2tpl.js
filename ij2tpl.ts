// Copyright (c) 2018-2020 urain39 <urain39[AT]qq[DOT]com>

export const version: string = '0.0.3-dev';

// Compatible for ES3-ES5
if (!Array.isArray) {
	const objectToString = Object.prototype.toString;

	Array.isArray = function(value: any): value is any[] {
		return objectToString.call(value) === '[object Array]';
	};
}

if (!String.prototype.trim) {
	String.prototype.trim = function(): string {
		return this.replace(/^[\s\xA0\uFEFF]+|[\s\xA0\uFEFF]+$/g, '');
	};
}

const enum TokenMember {
	TYPE = 0,
	VALUE,
	BLOCK,
}

const enum TokenType {
	IF = 0,	// '?'
	NOT,	// '!'
	ELSE,	// '*' (Re-working)
	END,	// '/'
	TEXT,
	RAW,	// '#'
	FORMAT,
	INVALID
}

// See https://github.com/microsoft/TypeScript/pull/33050
//     https://stackoverflow.com/questions/47842266/recursive-types-in-typescript
type TokenTuple<T> = [TokenType, string, T[]?];
interface IToken extends TokenTuple<IToken> {}

interface IMap {
	[key: string]: any;
	[index: number]: any;
}

let TokenTypeMap: IMap = {
	'?': TokenType.IF,
	'!': TokenType.NOT,
	'*': TokenType.ELSE,
	'/': TokenType.END,
	'#': TokenType.RAW
};

export function tokenize(source: string, prefix: string, suffix: string): IToken[] {
	let type_: string,
		value: string,
		token: IToken = [TokenType.INVALID, '^'],
		tokens: IToken[] = [];

	for (let i = 0, j = 0,
		l = source.length,
		pl = prefix.length,
		sl = suffix.length; i < l;) {
		// Match '{'
		j = source.indexOf(prefix, i);

		// Not found the '{'
		if (j === -1) {
			// Eat the rest of the source
			value = source.slice(i);

			if (value)
				token = [TokenType.TEXT, value], tokens.push(token);

			break; // Done
		}

		// Eat the left side of a token
		value = source.slice(i, j);
		j += pl; // Skip the '{'

		// Don't eat the empty text ''
		if (value)
			token = [TokenType.TEXT, value], tokens.push(token);

		// Match '}'
		i = source.indexOf(suffix, j);

		// Not found the '}'
		if (i === -1)
			throw new SyntaxError(`No match prefix '${prefix}'`);

		// Eat the text between the '{' and '}'
		value = source.slice(j, i);
		i += sl; // Skip the '}'

		// Skip the empty token, such as '{}'
		if (!value)
			continue;

		value = value.trim();

		type_ = value[0];

		switch (type_) {
		case '?':
		case '!':
		case '*':
		// XXX: need replace when TypeScript support
		// eslint-like ignore-syntax with given errors.
		// @ts-ignore TS7029: Fallthrough case in switch
		case '/':
			// Remove section's indentations if exists
			if (token[TokenMember.TYPE] === TokenType.TEXT)
				if (/(?:^|[\n\r])[\t \xA0\uFEFF]+$/.test(token[TokenMember.VALUE]))
					token[TokenMember.VALUE] = token[TokenMember.VALUE].replace(/[\s\xA0\uFEFF]+$/g, '');

			// Skip section's newline if exists
			if (i < l) {
				switch (source[i]) {
				case '\n':
					i += 1; // LF
					break;
				case '\r':
					i += source.charAt(i + 1) === '\n' ?
						2 // CRLF
					:
						1 // CR
					;
					break;
				}
			}
		case '#':
			value = value.slice(1).trim();
			token = [TokenTypeMap[type_], value], tokens.push(token);
			break;
		case '-': // comment
			break;
		default:
			token = [TokenType.FORMAT, value], tokens.push(token);
			break;
		}
	}

	return tokens;
}

let htmlEntityMap: IMap = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#39;',
	'`': '&#x60;',
	'=': '&#x3D;',
	'/': '&#x2F;'
};

export function escapeHTML(value: any): string {
	return String(value).replace(/[&<>"'`=\/]/g, function(key: string): string {
		return htmlEntityMap[key];
	});
}

export class Context {
	private data: IMap;
	private cache: IMap;
	private parent: Context | null;

	public constructor(data: IMap, parent: Context | null) {
		this.data = data;
		this.parent = parent;
		this.cache = { '.': this.data };
	}

	public resolve(name: string): any {
		let data: IMap,
			cache: IMap,
			value: any = null,
			context: Context | null = this;

		cache = context.cache;

		// Cached in context?
		if (cache.hasOwnProperty(name)) {
			value = cache[name];
		} else {
			// No cached record found
			if (name.indexOf('.') > 0) {
				let name_: string,
					names: string[] = name.split('.');

				name_ = names[0];

				// Try to look up the (first)name in data
				for (; context; context = context.parent) {
					data = context.data;

					// Find out which context contains name
					if (data && data.hasOwnProperty && data.hasOwnProperty(name_)) {
						value = (data as IMap)[name_];

						// Resolve sub-names
						for (let i = 1, l = names.length; i < l; i++) {
							name_ = names[i];

							if (value && value.hasOwnProperty && value.hasOwnProperty(name_)) {
								value = value[name_];
							} else {
								value = null // Reset value
								break;
							}
						}
						break;
					}
				}
			} else {
				// Try to look up the name in data
				for (; context; context = context.parent) {
					data = context.data;

					// Find out which context contains name
					if (data && data.hasOwnProperty && data.hasOwnProperty(name)) {
						value = (data as IMap)[name];
						break;
					}
				}
			}

			// Support for function
			if (typeof value === 'function')
				value = value(context);

			// Cache the name
			cache[name] = value;
		}

		return value;
	}
}

export class Renderer {
	private treeRoot: IToken[];

	public constructor(treeRoot: IToken[]) {
		this.treeRoot = treeRoot;
	}

	public renderTree(treeRoot: IToken[], context: Context): string {
		let value: any,
			buffer: string = '';

		for (const token of treeRoot) {
			switch (token[TokenMember.TYPE]) {
			case TokenType.IF:
				value = context.resolve(token[TokenMember.VALUE]);

				if (!value)
					continue;
				else if (Array.isArray(value))
					for (const value_ of value)
						buffer += this.renderTree(
							token[TokenMember.BLOCK] as IToken[],
							new Context(value_, context)
						);
				else
					buffer += this.renderTree(
						token[TokenMember.BLOCK] as IToken[],
						new Context(value, context)
					);
				break;
			case TokenType.NOT:
				value = context.resolve(token[TokenMember.VALUE]);

				if (!value || Array.isArray(value) && value.length < 1)
					buffer += this.renderTree(
						token[TokenMember.BLOCK] as IToken[],
						context
					);
				break;
			case TokenType.TEXT:
				buffer += token[TokenMember.VALUE];
				break;
			case TokenType.RAW:
				value = context.resolve(token[TokenMember.VALUE]);

				// Check if it is non-values(null and undefined)
				if (value != null)
					buffer += value;

				break;
			case TokenType.FORMAT:
				value = context.resolve(token[TokenMember.VALUE]);

				if (value != null)
					// NOTE: `<object>.toString` will be called when we try to
					// append a stringified object to buffer, it is not safe!
					buffer += typeof value === 'number' ?
						value
					:
						escapeHTML(value)
					;
				break;
			}
		}

		return buffer;
	}

	public render(data: IMap): string {
		return this.renderTree(
			this.treeRoot, new Context(data, null)
		);
	}
}

function buildTree(tokens: IToken[]): IToken[] {
	let section: IToken | undefined,
		sections: IToken[] = [],
		treeRoot: IToken[] = [],
		collector: IToken[] = treeRoot;

	for (const token of tokens) {
		switch (token[TokenMember.TYPE]) {
		// Enter a section
		case TokenType.IF:
		case TokenType.NOT:
			// Current block saves token
			collector.push(token);
			section = token;
			// Stack saves section
			sections.push(section);
			// Initialize section block
			collector = section[TokenMember.BLOCK] = [];
			break;
		// Leave a section
		case TokenType.END:
			section = sections.pop();

			// Check if section is not match
			if (!section || token[TokenMember.VALUE] !== section[TokenMember.VALUE])
				throw new SyntaxError(`Unexpected token '<type=${token[TokenMember.TYPE]}, value=${token[TokenMember.VALUE]}>'`);

			// Re-bind block to parent block
			sections.length > 0 ?
				collector = (sections[sections.length - 1] as IToken)[TokenMember.BLOCK] as IToken[]
			:
				collector = treeRoot
			;
			break;
		// Text or Formatter
		default:
			collector.push(token);
		}
	}

	if (sections.length > 0) {
		section = sections.pop() as IToken;
		throw new SyntaxError(`No match section '<type=${section[TokenMember.TYPE]}, value=${section[TokenMember.VALUE]}>'`);
	}

	return treeRoot;
}

export function parse(source: string, prefix: string = '{', suffix: string = '}'): Renderer {
	let treeRoot = buildTree(tokenize(
		source, prefix, suffix
	));

	return new Renderer(treeRoot);
}
