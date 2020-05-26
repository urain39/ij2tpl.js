// Copyright (c) 2018-2020 urain39 <urain39[AT]qq[DOT]com>

export const version: string = '0.1.0-dev';

if (!String.prototype.trim) {
	const WhiteSpaceRe = /^[\s\xA0\uFEFF]+|[\s\xA0\uFEFF]+$/g;

	String.prototype.trim = function(): string {
		return this.replace(WhiteSpaceRe, '');
	};
}

/* eslint-disable no-unused-vars */

// XXX: ^^^ it seems that is a bug of ESLint

const enum TokenMember {
	TYPE = 0,
	VALUE,
	BLOCK,
	ELSE_BLOCK
}

const enum TokenString {
	IF =	'?',
	NOT =	'!',
	ELSE =	'*',
	END =	'/',
	RAW =	'#',
	COMMENT = '-'
}

const enum TokenType {
	IF = 0,
	NOT,
	ELSE,
	END,
	TEXT,
	RAW,
	FORMAT,
	COMMENT
}
/* eslint-enable no-unused-vars */

// See https://github.com/microsoft/TypeScript/pull/33050
//     https://stackoverflow.com/questions/47842266/recursive-types-in-typescript
type TokenTuple<T> = [TokenType, string, T[]?, T[]?];
interface IToken extends TokenTuple<IToken> {}

interface IMap {
	[key: string]: any;
	[index: number]: any;
}

// See https://github.com/microsoft/TypeScript/issues/14682
const TokenTypeMap: IMap = {
	[TokenString.IF]:	TokenType.IF,
	[TokenString.NOT]:	TokenType.NOT,
	[TokenString.ELSE]:	TokenType.ELSE,
	[TokenString.END]:	TokenType.END,
	[TokenString.RAW]:	TokenType.RAW,
	[TokenString.COMMENT]:	TokenType.COMMENT
};

// NOTE: if we use `IndentedTestRe` with capture-group directly, the `<string>.replace` method
//     will always generate a new string. So we need test it before replace it ;)
const IndentedTestRe = /(?:^|[\n\r])[\t \xA0\uFEFF]+$/,
	IndentedWhiteSpaceRe = /[\t \xA0\uFEFF]+$/g;

export function tokenize(source: string, prefix: string, suffix: string): IToken[] {
	let type_: string,
		value: string,
		token: IToken = [TokenType.COMMENT, ''], // Initialized for loop
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
			throw new SyntaxError(`No matching prefix '${prefix}'`);

		// Eat the text between the '{' and '}'
		value = source.slice(j, i);
		i += sl; // Skip the '}'

		// Skip the empty token, such as '{}'
		if (!value)
			continue;

		value = value.trim();

		type_ = value[0];

		switch (type_) {
		case TokenString.IF:
		case TokenString.NOT:
		case TokenString.ELSE:
		case TokenString.END:
			// Remove section's indentation if exists
			if (token[TokenMember.TYPE] === TokenType.TEXT) {
				if (IndentedTestRe.test(token[TokenMember.VALUE]))
					token[TokenMember.VALUE] = token[TokenMember.VALUE].replace(IndentedWhiteSpaceRe, '');

				if(!token[TokenMember.VALUE])
					tokens.pop(); // Drop the empty text ''
			}

			// Skip section's newline if exists
			if (i < l) {
				switch (source[i]) {
				case '\n':
					i += 1; // LF
					break;
				case '\r':
					// Have next character?
					i += i + 1 < l ?
						// Yes, next character is LF?
						source[i + 1] === '\n' ?
							2 // Yes, then newline is CRLF
							:
							1 // No, then newline is CR
						:
						1 // No, then newline is CR
					;
					break;
				}
			}
		// eslint-disable-line no-fallthrough
		case TokenString.RAW:
			value = value.slice(1).trim();
			token = [TokenTypeMap[type_], value], tokens.push(token);
			break;
		case TokenString.COMMENT:
			// Remove comment's indentation if exists
			if (token[TokenMember.TYPE] === TokenType.TEXT) {
				if (IndentedTestRe.test(token[TokenMember.VALUE]))
					token[TokenMember.VALUE] = token[TokenMember.VALUE].replace(IndentedWhiteSpaceRe, '');

				if(!token[TokenMember.VALUE])
					tokens.pop(); // Drop the empty text ''
			}
			break; // Difference with section, we keep comments newline here
		default:
			token = [TokenType.FORMAT, value], tokens.push(token);
			break;
		}
	}

	return tokens;
}

// eslint-disable-next-line no-useless-escape
const htmlSpecialRe = /["&'\/<=>`]/g,
	htmlSpecialEntityMap: IMap = {
		'"': '&quot;',
		'&': '&amp;',
		"'": '&#39;', // eslint-disable-line quotes
		'/': '&#x2F;',
		'<': '&lt;',
		'=': '&#x3D;',
		'>': '&gt;',
		'`': '&#x60;'
	};

// See https://github.com/janl/mustache.js/pull/530
function escapeHTML(value: any): string {
	return String(value).replace(htmlSpecialRe, function(key: string): string {
		return htmlSpecialEntityMap[key];
	});
}

export const escape = escapeHTML; // We don't wanna user use a long name to call function

const hasOwnProperty = {}.hasOwnProperty;

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
		if (hasOwnProperty.call(cache, name)) {
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
					if (data && hasOwnProperty.call(data, name_)) {
						value = (data as IMap)[name_];

						// Resolve sub-names
						for (let i = 1, l = names.length; i < l; i++) {
							name_ = names[i];

							if (value && hasOwnProperty.call(value, name_)) {
								value = value[name_];
							} else {
								value = null; // Reset value
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
					if (data && hasOwnProperty.call(data, name)) {
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

let isArray = Array.isArray;

if (!isArray) {
	const toString = {}.toString;

	isArray = function(value: any): value is any[] {
		return toString.call(value) === '[object Array]';
	};
}

export class Renderer {
	private treeRoot: IToken[];

	public constructor(treeRoot: IToken[]) {
		this.treeRoot = treeRoot;
	}

	public renderTree(treeRoot: IToken[], context: Context): string {
		let value: any,
			buffer: string = '',
			isArray_: boolean = false;

		for (const token of treeRoot) {
			switch (token[TokenMember.TYPE]) {
			case TokenType.IF:
				value = context.resolve(token[TokenMember.VALUE]);
				isArray_ = isArray(value);

				// We can only know true or false after we sure it is array or not
				if (isArray_ ? value.length > 0 : value) {
					if (isArray_)
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
				}
				break;
			case TokenType.NOT:
				value = context.resolve(token[TokenMember.VALUE]);
				isArray_ = isArray(value);

				if (isArray_ ? value.length < 1 : !value)
					buffer += this.renderTree(
						token[TokenMember.BLOCK] as IToken[],
						context
					);
				break;
			case TokenType.ELSE:
				value = context.resolve(token[TokenMember.VALUE]);
				isArray_ = isArray(value);

				if (isArray_ ? value.length > 0 : value) {
					if (isArray_)
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
				} else {
					buffer += this.renderTree(
						token[TokenMember.ELSE_BLOCK] as IToken[],
						context
					);
				}
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
					//     append a stringified object to buffer, it is not safe!
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

const TokenTypeReverseMap: IMap = {
	[TokenType.IF]:	TokenString.IF,
	[TokenType.NOT]:	TokenString.NOT,
	[TokenType.ELSE]:	TokenString.ELSE,
	[TokenType.END]:	TokenString.END,
	[TokenType.RAW]:	TokenString.RAW
};

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
		// Switch section block
		case TokenType.ELSE:
			section = sections.length > 0 ?
				sections[sections.length - 1]
				:
				void 0 // Reset
			;

			// Check current(or top) section is valid?
			if (!section || section[TokenMember.TYPE] !== TokenType.IF || token[TokenMember.VALUE] !== section[TokenMember.VALUE])
				throw new SyntaxError(`Unexpected token '<type=${
					TokenTypeReverseMap[token[TokenMember.TYPE]]}, value=${token[TokenMember.VALUE]}>'`);

			// Switch the block to else-block
			collector = section[TokenMember.ELSE_BLOCK] = [];
			break;
		// Leave a section
		case TokenType.END:
			section = sections.pop();

			// Check if section is not match
			if (!section || token[TokenMember.VALUE] !== section[TokenMember.VALUE])
				throw new SyntaxError(`Unexpected token '<type=${
					TokenTypeReverseMap[token[TokenMember.TYPE]]}, value=${token[TokenMember.VALUE]}>'`);

			// Change type for which section contains non-empty else-block
			if (isArray((section as IToken)[TokenMember.ELSE_BLOCK]) && (section[TokenMember.ELSE_BLOCK] as IToken[]).length > 0)
				section[TokenMember.TYPE] = TokenType.ELSE;

			// Re-bind block to parent block
			if (sections.length > 0)
				// Is parent section has initialized else-block?
				collector = ((section = (sections[sections.length - 1] as IToken), isArray(section[TokenMember.ELSE_BLOCK])) ?
					// Yes, then parent block is else-block
					section[TokenMember.ELSE_BLOCK]
					:
					// No, then parent block is (if-)block
					section[TokenMember.BLOCK]) as IToken[]
				;
			else
				collector = treeRoot;
			break;
		// Text or Formatter
		default:
			collector.push(token);
			break;
		}
	}

	if (sections.length > 0) {
		section = sections.pop() as IToken;

		throw new SyntaxError(`No matching section '<type=${
			TokenTypeReverseMap[section[TokenMember.TYPE]]}, value=${section[TokenMember.VALUE]}>'`);
	}

	return treeRoot;
}

export function parse(source: string, prefix: string = '{', suffix: string = '}'): Renderer {
	const treeRoot = buildTree(tokenize(
		source, prefix, suffix
	));

	return new Renderer(treeRoot);
}
