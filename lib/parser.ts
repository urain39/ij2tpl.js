// Copyright (c) 2018-2019 urain39 <urain39[AT]qq[DOT]com>

import { Token, TokenMember, TokenType, tokenize } from './tokenizer';
import { Renderer } from './renderer';

function buildTree(tokens: Token[]): Token[] {
	let token: Token,
		type_: TokenType,
		value: string,
		section: Token | undefined,
		sections: Token[] = [],
		treeRoot: Token[] = [],
		collector: Token[] = treeRoot;

	for (let i = 0; i < tokens.length; i++) {
		token = tokens[i];
		type_ = token[TokenMember.TYPE];
		value = token[TokenMember.VALUE];

		switch (type_) {
		case TokenType.IF:
		case TokenType.NOT:
			collector.push(token);
			section = token;
			sections.push(section);
			section[TokenMember.ELSE_BLOCK] = null;
			collector = section[TokenMember.BLOCK] = [];
			break;
		case TokenType.ELSE:
			section = sections[sections.length - 1];

			if (!section || section[TokenMember.TYPE] !== TokenType.IF || value !== section[TokenMember.VALUE])
				throw new SyntaxError(`Unexpected token '<type=${type_}, value=${value}>'`);

			collector = section[TokenMember.ELSE_BLOCK] = [];
			break;
		case TokenType.END:
			section = sections.pop();

			if (!section || value !== section[TokenMember.VALUE])
				throw new SyntaxError(`Unexpected token '<type=${type_}, value=${value}>'`);

			if ((<Token>section)[TokenMember.ELSE_BLOCK] instanceof Array && section[TokenMember.ELSE_BLOCK].length > 0)
				section[TokenMember.TYPE] = TokenType.ELSE;

			if (sections.length > 0)
				collector = ((<Token>section) = sections[sections.length - 1], section[TokenMember.ELSE_BLOCK] instanceof Array) ?
					section[TokenMember.ELSE_BLOCK] : section[TokenMember.BLOCK];
			else
				collector = treeRoot;
			break;
		default:
			collector.push(token);
		}
	}

	if (sections.length > 0) {
		section = (<Token>sections.pop());
		type_ = section[TokenMember.TYPE];
		value = section[TokenMember.VALUE];

		throw new SyntaxError(`No match section '<type=${type_}, value=${value}>'`);
	}

	return treeRoot;
}

export function parse(source: string, prefix: string = '{', suffix: string = '}'): Renderer {
	let treeRoot = buildTree(tokenize(
		source, prefix, suffix
	));

	return new Renderer(treeRoot);
}
