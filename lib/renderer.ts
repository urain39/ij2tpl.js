// Copyright (c) 2018-2019 urain39 <urain39[AT]qq[DOT]com>

import { Token, TokenMember, TokenType } from './tokenizer';

export type Map = Object;

export class Context {
	private cache = [];

	public lookup(name: string): any {
		
	}

	public constructor(data: Map) {
		
	}
}

export class Renderer {
	private treeRoot: Token[];

	public constructor(treeRoot: Token[]) {
		this.treeRoot = treeRoot;
	}
}
