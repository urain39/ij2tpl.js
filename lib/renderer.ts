// Copyright (c) 2018-2019 urain39 <urain39[AT]qq[DOT]com>

import {
	Token,
	TokenMember,
	TokenType
} from './tokenizer';

export interface Map {
	[key: string]: any;
	[index: number]: any;
}

export class Context {
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

export class Renderer {
	private treeRoot: Token[];

	public constructor(treeRoot: Token[]) {
		this.treeRoot = treeRoot;
	}

	public renderTree(treeRoot: Token[], context: Context): string[] {
		let value: any,
			buffer: string[] = [];

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
						context
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
							context
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
				buffer.push(context.resolve(
					token[TokenMember.VALUE]
				));
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
