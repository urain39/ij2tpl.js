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
			let name_: string,
				properties: string[] = name.split('.');

			name_ = properties[0];
			properties = properties.slice(1);

			// Try to look up the name in data
			for (let context: Context | undefined = this; context; context = context.parent) {
				// Find out which context contains name
				if (context.data.hasOwnProperty(name_)) {
					value = context.data[name_];
					break;
				}
			}

			// Resolve properties
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

	public render(data: Map): any {
		// TODO:
	}
}
