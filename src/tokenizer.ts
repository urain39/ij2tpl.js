// Copyright (c) 2018-2019 urain39 <urain39[AT]qq[DOT]com>

const enum TokenType {
	IF = 0, // '?'
	NOT,	// '!'
	ELSE,	// '*'
	END,	// '/'
	TEXT,
	FORMAT,	// '#'
	FORMAT_ESCAPE
}

const enum TokenMember {
	TYPE = 0,
	VALUE,
	BLOCK,
	ELSE_BLOCK
}

let TokenTypeMap = {
	'?': TokenType.IF,
	'!': TokenType.NOT,
	'*': TokenType.ELSE,
	'/': TokenType.END,
	'#': TokenType.FORMAT
}

type Token = Array<any>;
//class Token extends Array {};

function tokenize(source: string, prefix: string, suffix: string): Array<Token> {
	let type_: string,
		value: string,
		tokens: Array<Token> = [];

	for (let i = 0, j = 0; i < source.length;) {
		j = source.indexOf(prefix, i);

		if (j === -1) {
			value = source.slice(i, source.length);

			if (value.length > 0)
				tokens.push([TokenType.TEXT, value]);

			break;
		}

		value = source.slice(i, j);
		j += prefix.length;

		if (value.length > 0)
			tokens.push([TokenType.TEXT, value]);

		i = source.indexOf(suffix, j);

		if (i === -1)
			throw new SyntaxError(`No match prefix '${prefix}'`);

		value = source.slice(j, i);
		i += suffix.length;

		type_ = value[0];

		switch (type_) {
		case '?':
		case '!':
		case '*':
		case '/':
		case '#':
			tokens.push([TokenTypeMap[type_], value.slice(1)]);
			break;
		default:
			tokens.push([TokenType.FORMAT_ESCAPE, value]);
		}
	}

	return tokens;
}
