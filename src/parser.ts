import { Token, TokenMember, TokenType, tokenize } from './tokenizer';

export function buildTree(tokens: Token[]): Token[] {
	let token: Token,
		type: TokenType,
		value: string,
		section: Token,
		sections: Token[] = [],
		treeRoot: Token[] = [],
		collector: Token[] = treeRoot;

	for (let i = 0; i < tokens.length; i++) {
		token = tokens[i];
		type = token[TokenMember.TYPE];
		value = token[TokenMember.VALUE];

		switch (type) {
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
				throw new SyntaxError(`No match token '<type=${type}, value=${value}>'`);

			collector = section[TokenMember.ELSE_BLOCK] = [];
			break;
		case TokenType.END:
			section = sections.pop();

			if (!section || value !== section[TokenMember.VALUE])
				throw new SyntaxError(`No match token '<type=${type}, value=${value}>'`);

			if (section[TokenMember.ELSE_BLOCK] instanceof Array && sections.length > 0)
				section[TokenMember.TYPE] = TokenType.ELSE;

			if (sections.length > 0)
				collector = (section = sections[sections.length - 1], section[TokenMember.ELSE_BLOCK] instanceof Array) ?
					section[TokenMember.ELSE_BLOCK] : section[TokenMember.BLOCK];
			else
				collector = treeRoot;
		}
	}

	return treeRoot;
}
