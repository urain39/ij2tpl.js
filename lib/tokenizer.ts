// Copyright (c) 2018-2019 urain39 <urain39[AT]qq[DOT]com>

export const enum TokenMember {
	TYPE = 0,
	VALUE,
	BLOCK,
	ELSE_BLOCK
}

export const enum TokenType {
	IF = 0, // '?'
	NOT,	// '!'
	ELSE,	// '*'
	END,	// '/'
	TEXT,
	FORMAT,	// '#'
	FORMAT_ESCAPE
}

let TokenTypeMap = {
	'?': TokenType.IF,
	'!': TokenType.NOT,
	'*': TokenType.ELSE,
	'/': TokenType.END,
	'#': TokenType.FORMAT
};

// See https://github.com/microsoft/TypeScript/pull/33050
//     https://stackoverflow.com/questions/47842266/recursive-types-in-typescript
type TokenTuple<T> = [TokenType, string, T[] | undefined, T[] | undefined];
export interface Token extends TokenTuple<Token> {}

export function tokenize(source: string, prefix: string, suffix: string): Token[] {
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

