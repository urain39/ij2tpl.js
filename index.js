import {
	tokenize,
	TokenTypeMap
} from './lib/tokenizer';
import { parse } from './lib/parser';

var IJ2TPL = {
	tokenize: tokenize,
	parse: parse
};

export {
	IJ2TPL,
	TokenTypeMap
};
