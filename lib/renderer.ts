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
			let key: string,
				keys: string[] = name.split('.');

			key = keys[0];
			keys = keys.slice(1);

			// Try to look up the name in data
			for (let context: Context | undefined = this; context; context = context.parent) {
				// Find out which context contains key
				if (context.data.hasOwnProperty(key)) {
					value = context.data[key];
					break;
				}
			}

			// Resolve properties
			for (key of keys) {
				if (value instanceof Object && value.hasOwnProperty(key)) {
					value = value[key];
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

		value = context.resolve('');
	}
}
