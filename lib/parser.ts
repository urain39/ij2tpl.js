// Copyright (c) 2018-2019 urain39 <urain39[AT]qq[DOT]com>

import { Token, TokenMember, TokenType, tokenize } from './tokenizer';
import { Renderer } from './renderer';

function buildTree(tokens: Token[]): Token[] {
	let type_: TokenType,
		value: string,
		section: Token | undefined,
		sections: Token[] = [],
		treeRoot: Token[] = [],
		collector: Token[] = treeRoot;

	for (let token of tokens) {
		type_ = token[TokenMember.TYPE];
		value = token[TokenMember.VALUE];

		switch (type_) {
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
		case TokenType.ELSE:
			section = sections[sections.length - 1];

			// Check current(top) section is valid?
			if (!section || section[TokenMember.TYPE] !== TokenType.IF || value !== section[TokenMember.VALUE])
				throw new SyntaxError(`Unexpected token '<type=${type_}, value=${value}>'`);

			// Switch the block to else block
			collector = section[TokenMember.ELSE_BLOCK] = [];
			break;
		case TokenType.END:
			section = sections.pop();

			// Check if section is not match
			if (!section || value !== section[TokenMember.VALUE])
				throw new SyntaxError(`Unexpected token '<type=${type_}, value=${value}>'`);

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
		default:
			collector.push(token);
		}
	}

	if (sections.length > 0) {
		section = (sections.pop() as Token);
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
