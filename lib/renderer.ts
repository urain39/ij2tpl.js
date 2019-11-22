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

		// Not found, try to look up the name in data.
		if (!found) {
			let keys: string[] = name.split('.');

			for (let context: Context | undefined = this; context; context = context.parent) {
				// TODO:
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

	public render(data: Map): any {
		let value: any = null,
			context = new Context(data);

		value = context.lookup('');
	}
}
