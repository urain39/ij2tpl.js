// Copyright (c) 2018-2019 urain39 <urain39[AT]qq[DOT]com>

import { Token, TokenMember, TokenType } from './tokenizer';

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

	public lookup(name: string): any {
		let value: any;

		if (this.cache.hasOwnProperty(name)) {
			value = this.cache[name];
		} else {
			let context = this;

			for (; context.parent; ) {
				
			}
		}

		return value;
	}

	public push(data: Map): Context {
		return new Context(data, this);
	}
}

export class Renderer {
	private treeRoot: Token[];

	public constructor(treeRoot: Token[]) {
		this.treeRoot = treeRoot;
	}
}
