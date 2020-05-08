// Copyright (c) 2018-2019 urain39 <urain39[AT]qq[DOT]com>

interface IMap {
	[key: string]: any;
	[index: number]: any;
}

const enum TokenMember {
	TYPE = 0,
	VALUE,
	BLOCK,
}

const enum TokenType {
	IF = 0, // '?'
	NOT,	// '!'
	END,	// '/'
	TEXT,
	RAW,	// '#'
	FORMAT
}

// See https://github.com/microsoft/TypeScript/pull/33050
//     https://stackoverflow.com/questions/47842266/recursive-types-in-typescript
type TokenTuple<T> = [TokenType, string, T[]?];
interface IToken extends TokenTuple<IToken> {}

let TokenTypeMap: IMap = {
	'?': TokenType.IF,
	'!': TokenType.NOT,
	'/': TokenType.END,
	'#': TokenType.RAW
};

export function tokenize(source: string, prefix: string, suffix: string): IToken[] {
	let type_: string,
		value: string,
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

			if (value.length > 0)
				tokens.push([TokenType.TEXT, value]);

			break; // Done
		}

		// Eat the left side of a token
		value = source.slice(i, j);
		j += pl; // Skip the '{'

		// Don't eat the empty text ''
		if (value.length > 0)
			tokens.push([TokenType.TEXT, value]);

		// Match '}'
		i = source.indexOf(suffix, j);

		// Not found the '}'
		if (i === -1)
			throw new SyntaxError(`No match prefix '${prefix}'`);

		// Eat the text between the '{' and '}'
		value = source.slice(j, i);
		i += sl; // Skip the '}'

		// Skip the empty token, such as '{}'
		if (value.length < 1)
			continue;

		type_ = value[0];

		switch (type_) {
		case '?':
		case '!':
		case '/':
		case '#':
			value = value.slice(1);
			tokens.push([TokenTypeMap[type_], value]);
			break;
		case '-': // comment
			break;
		default:
			tokens.push([TokenType.FORMAT, value]);
		}
	}

	return tokens;
}

function escapeHTML(value: any): string {
	return String(value).replace(/[&<>"'`=\/]/g, function(key: string): string {
		return ({
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			'"': '&quot;',
			"'": '&#39;',
			'`': '&#x60;',
			'=': '&#x3D;',
			'/': '&#x2F;'
		} as IMap)[key];
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
		let value: any = null,
			context: Context | null = this;

		// Cached in context?
		if (context.cache.hasOwnProperty(name)) {
			value = context.cache[name];
		} else {
			// No cached record found
			if (name.indexOf('.') > 0) {
				let name_: string,
					names: string[] = name.split('.');

				name_ = names[0];

				// Try to look up the (first)name in data
				for (; context; context = context.parent) {
					// Find out which context contains name
					if (context.data && context.data.hasOwnProperty && context.data.hasOwnProperty(name_)) {
						value = (context.data as IMap)[name_];

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
					// Find out which context contains name
					if (context.data && context.data.hasOwnProperty && context.data.hasOwnProperty(name)) {
						value = (context.data as IMap)[name];
						break;
					}
				}
			}

			// Cache the name          vvvvv NOTE: value may be undefined
			this.cache[name] = value = value ? value : null;
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

				if (value instanceof Array)
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

				if (!value || value instanceof Array && value.length < 1)
					buffer += this.renderTree(
						token[TokenMember.BLOCK] as IToken[],
						context
					);
				break;
			case TokenType.TEXT:
				buffer += token[TokenMember.VALUE];
				break;
			case TokenType.RAW:
				buffer += context.resolve(
					token[TokenMember.VALUE]
				);
				break;
			case TokenType.FORMAT:
				buffer += escapeHTML(context.resolve(
					token[TokenMember.VALUE]
				));
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
