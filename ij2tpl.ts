// Copyright (c) 2018-2019 urain39 <urain39[AT]qq[DOT]com>

interface Map {
	[key: string]: any;
	[index: number]: any;
}

const enum TokenMember {
	TYPE = 0,
	VALUE,
	BLOCK,
	ELSE_BLOCK
}

const enum TokenType {
	IF = 0, // '?'
	NOT,	// '!'
	ELSE,	// '*'
	END,	// '/'
	TEXT,
	FORMAT,	// '#'
	FORMAT_ESCAPE
}

// See https://github.com/microsoft/TypeScript/pull/33050
//     https://stackoverflow.com/questions/47842266/recursive-types-in-typescript
type TokenTuple<T> = [TokenType, string, T[] | undefined, T[] | undefined];
interface Token extends TokenTuple<Token> {}

let TokenTypeMap: Map = {
	'?': TokenType.IF,
	'!': TokenType.NOT,
	'*': TokenType.ELSE,
	'/': TokenType.END,
	'#': TokenType.FORMAT
};

function tokenize(source: string, prefix: string, suffix: string): Token[] {
	let type_: string,
		value: string,
		tokens: Token[] = [];

	for (let i = 0, j = 0; i < source.length;) {
		// Match '{'
		j = source.indexOf(prefix, i);

		// Not found the '{'
		if (j === -1) {
			value = source.slice(i, source.length);

			if (value.length > 0)
				tokens.push([TokenType.TEXT, value, undefined, undefined]);

			break; // Done
		}

		// Eat the left side of a token
		value = source.slice(i, j);
		j += prefix.length; // Skip the '{'

		// Don't eat the empty text ''
		if (value.length > 0)
			tokens.push([TokenType.TEXT, value, undefined, undefined]);

		// Match '}'
		i = source.indexOf(suffix, j);

		// Not found the '}'
		if (i === -1)
			throw new SyntaxError(`No match prefix '${prefix}'`);

		// Eat the text between the '{' and '}'
		value = source.slice(j, i);
		i += suffix.length; // Skip the '}'

		// Skip the empty token, such as '{}'
		if (value.length < 1)
			continue;

		type_ = value[0];

		switch (type_) {
		case '?':
		case '!':
		case '*':
		case '/':
		case '#':
			tokens.push([TokenTypeMap[type_], value.slice(1), undefined, undefined]);
			break;
		case '-':
			break;
		default:
			tokens.push([TokenType.FORMAT_ESCAPE, value, undefined, undefined]);
		}
	}

	return tokens;
}

function escapeHTML(value: any) {
	return String(value).replace(/[&<>"'`=\/]/g, function(key: string) {
		return ({
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			'"': '&quot;',
			"'": '&#39;',
			'`': '&#x60;',
			'=': '&#x3D;',
			'/': '&#x2F;'
		} as Map)[key];
	});
}

class Context {
	private data: Map;
	private cache: Map;
	private parent: Context | undefined;

	public constructor(data: Map, parent?: Context) {
		this.data = data;
		this.cache = { '.': this.data };

		if (parent)
			this.parent = parent;
	}

	public resolve(name: string): any {
		let value: any = null,
			found: boolean = false;

		// Maybe name cached in context and parents?
		for (let context: Context　| undefined = this; context; context = context.parent) {
			if (context.cache.hasOwnProperty(name)) {
				found = true;
				value = context.cache[name];
				break;
			}
		}

		// No cached record found
		if (!found) {
			let name_: string,
				properties: string[] = name.split('.');

			name_ = properties[0];
			properties = properties.slice(1);

			// Try to look up the name in data
			for (let context: Context | undefined = this; context; context = context.parent) {
				// Find out which context contains name
				if (context.data instanceof Object && context.data.hasOwnProperty(name_)) {
					value = (context.data as Map)[name_];
					break;
				}
			}

			// Resolve properties
			// XXX: Should we check value valid at first?
			for (const property of properties) {
				if (value instanceof Object && value.hasOwnProperty(property)) {
					value = value[property];
				} else {
					value = null // Reset value
					break;
				}
			}

			// Cache the name          vvvvv NOTE: value may be undefined
			this.cache[name] = value = value ? value : null;
		}

		return value;
	}
}

class Renderer {
	private treeRoot: Token[];

	public constructor(treeRoot: Token[]) {
		this.treeRoot = treeRoot;
	}

	public renderTree(treeRoot: Token[], context: Context): string[] {
		let value: any,
			buffer: any[] = [];

		for (const token of treeRoot) {
			switch (token[TokenMember.TYPE]) {
			case TokenType.IF:
				value = context.resolve(token[TokenMember.VALUE]);

				if (!value)
					continue;

				if (value instanceof Array)
					for (const value_ of value)
						buffer.push(this.renderTree(
							token[TokenMember.BLOCK] as Token[],
							new Context(value_, context)
						).join(''));
				else
					buffer.push(this.renderTree(
						token[TokenMember.BLOCK] as Token[],
						new Context(value, context)
					).join(''));
				break;
			case TokenType.NOT:
				value = context.resolve(token[TokenMember.VALUE]);

				if (value)
					continue;

				buffer.push(this.renderTree(
					token[TokenMember.BLOCK] as Token[],
					context
				).join(''));
				break;
			case TokenType.ELSE:
				value = context.resolve(token[TokenMember.VALUE]);

				if (value) {
					if (value instanceof Array)
						for (const value_ of value)
							buffer.push(this.renderTree(
								token[TokenMember.BLOCK] as Token[],
								new Context(value_, context)
							).join(''));
					else
						buffer.push(this.renderTree(
							token[TokenMember.BLOCK] as Token[],
							new Context(value, context)
						).join(''));
				} else {
					buffer.push(this.renderTree(
						token[TokenMember.ELSE_BLOCK] as Token[],
						context
					).join(''));
				}
				break;
			case TokenType.TEXT:
				buffer.push(
					token[TokenMember.VALUE]
				);
				break;
			case TokenType.FORMAT:
				buffer.push(context.resolve(
					token[TokenMember.VALUE]
				));
				break;
			// TODO: escapeHTML
			case TokenType.FORMAT_ESCAPE:
				buffer.push(escapeHTML(context.resolve(
					token[TokenMember.VALUE]
				)));
				break;
			}
		}

		return buffer;
	}

	public render(data: Map): string {
		return this.renderTree(
			this.treeRoot, new Context(data)
		).join('');
	}
}

function buildTree(tokens: Token[]): Token[] {
	let section: Token | undefined,
		sections: Token[] = [],
		treeRoot: Token[] = [],
		collector: Token[] = treeRoot;

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
			section = sections[sections.length - 1];

			// Check current(top) section is valid?
			if (!section || section[TokenMember.TYPE] !== TokenType.IF || token[TokenMember.VALUE] !== section[TokenMember.VALUE])
				throw new SyntaxError(`Unexpected token '<type=${token[TokenMember.TYPE]}, value=${token[TokenMember.VALUE]}>'`);

			// Switch the block to else block
			collector = section[TokenMember.ELSE_BLOCK] = [];
			break;
		// Leave a section
		case TokenType.END:
			section = sections.pop();

			// Check if section is not match
			if (!section || token[TokenMember.VALUE] !== section[TokenMember.VALUE])
				throw new SyntaxError(`Unexpected token '<type=${token[TokenMember.TYPE]}, value=${token[TokenMember.VALUE]}>'`);

			// Change type of which section contains else block
			if ((section as Token)[TokenMember.ELSE_BLOCK] instanceof Array && (section[TokenMember.ELSE_BLOCK] as Token[]).length > 0)
				section[TokenMember.TYPE] = TokenType.ELSE;

			// Re-bind block to parent block
			if (sections.length > 0)
				collector = ((section = (sections[sections.length - 1] as Token), section[TokenMember.ELSE_BLOCK] instanceof Array) ?
					section[TokenMember.ELSE_BLOCK] : section[TokenMember.BLOCK]) as Token[];
			else
				collector = treeRoot;
			break;
		// Text or Formatter
		default:
			collector.push(token);
		}
	}

	if (sections.length > 0) {
		section = sections.pop() as Token;

		throw new SyntaxError(`No match section '<type=${section[TokenMember.TYPE]}, value=${section[TokenMember.VALUE]}>'`);
	}

	return treeRoot;
}

function parse(source: string, prefix: string = '{', suffix: string = '}'): Renderer {
	let treeRoot = buildTree(tokenize(
		source, prefix, suffix
	));

	return new Renderer(treeRoot);
}

export let IJ2TPL = {
	parse,
	tokenize,
	Context,
	Renderer
};
