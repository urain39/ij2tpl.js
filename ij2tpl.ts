/**
 * @file IJ2TPL.js - A Lightweight Template Engine.
 * @version v0.1.2
 * @author urain39 <urain39@qq.com>
 * @copyright (c) 2018-2020 IJ2TPL.js / IJ2TPL.ts Authors.
 */

/* eslint-disable prefer-const */

export const version: string = '0.1.2';

/* eslint-disable no-unused-vars */
// FIXME: ^^^ It seems that is a bug of ESLint

const enum TokenString {
  IF =	'?'
  , NOT =	'!'
  , ELSE =	'*'
  , END =	'/'
  , RAW =	'#'
  , COMMENT =	'-'
  , PARTIAL =	'@'
}

const enum TokenType {
  IF = 0
  , NOT
  , ELSE
  , END
  , TEXT
  , RAW
  , FORMAT
  , COMMENT // Used for initialization only
  , PARTIAL
}

const enum TokenMember {
  TYPE = 0
  , VALUE
  , BLOCK
  , ELSE_BLOCK
}

const enum NameMember {
  NAME = 0
  , NAMES
  , FILTERS
  , IS_ACTION
}
/* eslint-enable no-unused-vars */

// Compatible tokenized tokens
type _Token = [TokenType, string];

//                  NAME    NAMES            FILTERS          IS_ACTION
export type Name = [string, string[] | null, string[] | null, boolean];

// See https://github.com/microsoft/TypeScript/pull/33050
//     https://stackoverflow.com/questions/47842266/recursive-types-in-typescript
type SectionTuple<T> = [TokenType, Name, T[], T[] | null];
// ^^^                                   BLOCK, ELSE_BLOCK

export interface Section extends SectionTuple<Section> {}

export type Text = _Token; // Text token same as tokenized token

export type Formatter = [TokenType, Name];

export type Partial = _Token; // Partial token same as tokenized token

// Token literally compatible all tokens
export type Token = _Token | Section | Text | Formatter | Partial;

// See TS1023, an index type must be `string` or `number`
interface IMap< /* K, */ V> { [key: string]: V; [index: number]: V; }

// FIXME: It's also a bug of ESLint
// eslint-disable-next-line no-unused-vars
export type Filter = (value: any) => any;

let filterMap: IMap<Filter> = {};

export function setFilterMap(filterMap_: IMap<Filter>): void {
  filterMap = filterMap_;
}

// See https://github.com/microsoft/TypeScript/issues/14682
const TokenTypeMap: IMap<TokenType> = {
  [TokenString.IF]:	TokenType.IF
  , [TokenString.NOT]:	TokenType.NOT
  , [TokenString.ELSE]:	TokenType.ELSE
  , [TokenString.END]:	TokenType.END
  , [TokenString.RAW]:	TokenType.RAW
  , [TokenString.PARTIAL]:	TokenType.PARTIAL
};

// NOTE: If we use `IndentedTestRe` with capture-group directly, the `<string>.replace` method
//     will always generate a new string. So we need test it before replace it ;)
const IndentedTestRe = /(?:^|[\n\r])[\t \xA0\uFEFF]+$/
  , IndentedWhiteSpaceRe = /[\t \xA0\uFEFF]+$/
  , stripIndentation = (token: _Token, tokens: _Token[]): void => {
    let value: string;

    // Remove token's indentation if exists
    if (token[TokenMember.TYPE] === TokenType.TEXT) {
      token = token as Text;
      value = token[TokenMember.VALUE];

      if (IndentedTestRe.test(value))
        value = value.replace(IndentedWhiteSpaceRe, '');

      if(value)
        token[TokenMember.VALUE] = value;
      else
        tokens.pop(); // Don't save text that has become empty
    }
  }
  // We strip all white spaces to make check section easy(for `buildTree`)
  , WhiteSpaceRe = /[\s\xA0\uFEFF]+/g
  , stripWhiteSpace = (string_: string): string => string_.replace(WhiteSpaceRe, '');

export function tokenize(source: string, prefix: string, suffix: string): _Token[] {
  let type_: string
    , value: string
    , token: Token = [TokenType.COMMENT, ''] // Initialized for first backward check
    , tokens: _Token[] = [];

  for (let i = 0, j = 0
    , l = source.length
    , pl = prefix.length
    , sl = suffix.length; i < l;
  ) {
    // Match '{'
    j = source.indexOf(prefix, i);

    // Not found the '{'
    if (j === -1) {
      // Eat the rest of the source
      value = source.slice(i);

      // Don't save the empty text ''
      if (value)
        token = [TokenType.TEXT, value], tokens.push(token);

      break; // Done
    }

    // Eat the left side of a token
    value = source.slice(i, j);
    j += pl; // Skip the '{'

    if (value)
      token = [TokenType.TEXT, value], tokens.push(token);

    // Match the '}'
    i = source.indexOf(suffix, j);

    // Not found the '}'
    if (i === -1)
      throw new Error(`No matching prefix '${prefix}'`);

    // We don't want to call `source.slice` for comments
    if (source[j] === TokenString.COMMENT) {
      stripIndentation(token, tokens);
      i += sl; // Skip the '}' for comments

      continue; // Tokenize next one
    }

    // Eat the text between the '{' and '}'
    value = source.slice(j, i);
    i += sl; // Skip the '}' for tokens

    value = stripWhiteSpace(value);

    if (!value)
      continue; // Skip the empty token, such as '{}'

    type_ = value[0];

    switch (type_) {
    case TokenString.IF:
    case TokenString.NOT:
    case TokenString.ELSE:
    case TokenString.END:
    case TokenString.PARTIAL:
      stripIndentation(token, tokens);

      // Skip section's newline if exists
      if (i < l) {
        switch (source[i]) {
        case '\n':
          i += 1; // LF
          break;
        case '\r':
          // Have next character?
          i += (j = i + 1) < l ?
            // Yes, next character is LF?
            source[j] === '\n' ?
              2 // Yes, then newline is CRLF
              :
              1 // No, then newline is CR
            :
            1 // No, then newline is CR
          ;
          break;
        }
      }
    // eslint-disable-line no-fallthrough
    case TokenString.RAW:
      token = [TokenTypeMap[type_], value.slice(1)], tokens.push(token);
      break;
    default:
      token = [TokenType.FORMAT, value], tokens.push(token);
      break;
    }
  }

  return tokens;
}

const hasOwnProperty = {}.hasOwnProperty
  // See https://github.com/janl/mustache.js/pull/530
  , htmlSpecialRe = /["&'\/<=>`]/g // eslint-disable-line no-useless-escape
  , htmlSpecialEntityMap: IMap<string> = {
    '"': '&quot;'
    , '&': '&amp;'
    , "'": '&#39;' // eslint-disable-line quotes
    , '/': '&#x2F;'
    , '<': '&lt;'
    , '=': '&#x3D;'
    , '>': '&gt;'
    , '`': '&#x60;'
  }
  , escapeHTML = (value: any): string => String(value).replace(
    htmlSpecialRe, (special: string): string => htmlSpecialEntityMap[special]
  );

let escapeFunction = escapeHTML; // Escape for HTML by default

export function escape(value: any): string {
  return escapeFunction(value);
}

export function setEscapeFunction(escapeFunction_: (value: any) => string): void {
  escapeFunction = escapeFunction_;
}

export class Context {
  public data: IMap<any>;
  public cache: IMap<any>;
  public parent: Context | null;

  public constructor(data: IMap<any>, parent: Context | null) {
    this.data = data;
    this.cache = { '.': this.data };
    this.parent = parent;
  }

  public resolve(name: Name): any {
    let data: IMap<any>
      , cache: IMap<any>
      , name_: string
      , name__: string
      , names: string[]
      , filters: string[]
      , value: any = null
      , context: Context | null = this
      , hasProperties: boolean = false;

    if (!name[NameMember.IS_ACTION]) {
      cache = context.cache;
      name_ = name[NameMember.NAME];

      // Cached in context?
      if (hasOwnProperty.call(cache, name_)) {
        value = cache[name_];
      } else { // No cached records found
        // eslint-disable-next-line no-cond-assign
        if (names = name[NameMember.NAMES] as string[]) {
          name__ = names[0];
          hasProperties = true;
        } else {
          name__ = name_;
        }

        // Try to look up the name in data
        do {
          data = context.data;

          // Find out which context contains name
          if (data && hasOwnProperty.call(data, name__)) {
            value = data[name__];

            // Resolve properties if exists
            if (hasProperties) {
              for (let i = 1, l = names.length; i < l; i++) {
                name__ = names[i];

                if (value && hasOwnProperty.call(value, name__)) {
                  value = value[name__];
                } else {
                  value = null; // Reset
                  break;
                }
              }
            }
            break;
          }

          context = context.parent;
        } while (context);

        // Support for function
        if (typeof value === 'function')
          value = value(context);

        // Cache the name
        cache[name_] = value;
      }
    }

    // eslint-disable-next-line no-cond-assign
    if (filters = name[NameMember.FILTERS] as string[]) {
      for (let i = 0, l = filters.length, filterName; i < l;) {
        filterName = filters[i++];

        if (hasOwnProperty.call(filterMap, filterName))
          value = filterMap[filterName](value);
        else
          throw new Error(`Cannot resolve filter '${filterName}'`);
      }
    }

    return value;
  }
}

let isArray = Array.isArray;

if (!isArray) {
  const toString = {}.toString;

  // XXX: Fix a possible issue
  isArray = <typeof isArray>function(value: any): value is any[] {
    return toString.call(value) === '[object Array]';
  };
}

export class Renderer {
  public treeRoot: Token[];

  public constructor(treeRoot: Token[]) {
    this.treeRoot = treeRoot;
  }

  public renderTree(treeRoot: Token[], context: Context, partialMap?: IMap<Renderer>): string {
    let value: any
      , valueLength!: number
      , section: Section
      , buffer: string = ''
      , isArray_: boolean = false;

    for (let i = 0, l = treeRoot.length, token; i < l;) {
      token = treeRoot[i++];

      switch (token[TokenMember.TYPE]) {
      case TokenType.IF:
        section = token as Section;
        value = context.resolve(section[TokenMember.VALUE]);
        isArray_ = isArray(value);

        // We can only know true or false after we sure it is array or not
        if (isArray_ ? valueLength = value.length : value) {
          if (isArray_)
            for (let i = 0, l = valueLength, value_; i < l;) {
              value_ = value[i++];

              buffer += this.renderTree(
                section[TokenMember.BLOCK]
                , new Context(value_, context)
                , partialMap
              );
            }
          else
            buffer += this.renderTree(
              section[TokenMember.BLOCK]
              , new Context(value, context)
              , partialMap
            );
        }
        break;
      case TokenType.NOT:
        section = token as Section;
        value = context.resolve(section[TokenMember.VALUE]);
        isArray_ = isArray(value);

        if (!(isArray_ ? value.length : value))
          buffer += this.renderTree(
            section[TokenMember.BLOCK]
            , context
            , partialMap
          );
        break;
      // FIXME: It may be slower than If-Section + Not-Section(about 1 ops/sec)
      case TokenType.ELSE:
        section = token as Section;
        value = context.resolve(section[TokenMember.VALUE]);
        isArray_ = isArray(value);

        if (isArray_ ? valueLength = value.length : value) {
          if (isArray_)
            for (let i = 0, l = valueLength, value_; i < l;) {
              value_ = value[i++];

              buffer += this.renderTree(
                section[TokenMember.BLOCK]
                , new Context(value_, context)
                , partialMap
              );
            }
          else
            buffer += this.renderTree(
              section[TokenMember.BLOCK]
              , new Context(value, context)
              , partialMap
            );
        } else {
          buffer += this.renderTree(
            section[TokenMember.ELSE_BLOCK] as Token[]
            , context
            , partialMap
          );
        }
        break;
      case TokenType.TEXT:
        token = token as Text;
        value = token[TokenMember.VALUE];

        // Empty text has been skipped when tokenizing
        buffer += value;
        break;
      case TokenType.RAW:
        token = token as Formatter;
        value = context.resolve(token[TokenMember.VALUE]);

        // Check if it is non-values(null and undefined)
        if (value != null)
          buffer += value;
        break;
      case TokenType.FORMAT:
        token = token as Formatter;
        value = context.resolve(token[TokenMember.VALUE]);

        if (value != null)
          buffer += escapeFunction === escapeHTML && typeof value === 'number' ?
            value // Numbers are absolutely safe for HTML
            :
            escapeFunction(value)
          ;
        break;
      case TokenType.PARTIAL:
        token = token as Partial;
        value = token[TokenMember.VALUE];

        if (partialMap && hasOwnProperty.call(partialMap, value))
          buffer += this.renderTree(partialMap[value].treeRoot, context, partialMap);
        else
          throw new Error(`Cannot resolve partial '${value}'`);
        break;
      }
    }

    return buffer;
  }

  public render(data: IMap<any>, partialMap?: IMap<Renderer>): string {
    return this.renderTree(
      this.treeRoot, new Context(data, null), partialMap
    );
  }
}

const TokenTypeReverseMap: IMap<TokenString> = {
  [TokenType.IF]:	TokenString.IF
  , [TokenType.NOT]:	TokenString.NOT
  , [TokenType.ELSE]:	TokenString.ELSE
  , [TokenType.END]:	TokenString.END
};

const processToken = (token_: _Token): Section | Formatter => {
  let name: string
    , names: string[] | null
    , filters: string[] | null
    , isAction: boolean
    , token: Token;

  names = null;
  filters = null;
  isAction = false;

  name = token_[TokenMember.VALUE];

  // NOTE: Name can be empty
  if (name.indexOf('|') !== -1) {
    filters = name.split('|');

    name = filters[0];
    filters = filters.slice(1);

    if (!name)
      isAction = true;
  }

  // One '.' means current data
  if (name.indexOf('.') > 0)
    names = name.split('.');

  // NOTE: Filters are just additional part of Token
  token = [token_[TokenMember.TYPE], [name, names, filters, isAction]];

  return token;
};

function buildTree(tokens: _Token[]): Token[] {
  let type_: TokenType
    , value: string
    , token: Token
    , collector: Token[]
    , elseBlock: Token[]
    , section: Section | undefined
    , sections: Section[] = []
    , sectionsLength: number
    , treeRoot: Token[] = [];

  collector = treeRoot;

  for (let i = 0, l = tokens.length, token_; i < l;) {
    token_ = tokens[i++];
    type_ = token_[TokenMember.TYPE];

    switch (type_) {
    // Enter a section
    case TokenType.IF:
    case TokenType.NOT:
      token = processToken(token_); // Make `_Token` -> `Token`
      collector.push(token); // Current block saves token

      section = token as Section;
      sections.push(section); // Stack saves section

      // Initialize and switch to section's block
      collector = section[TokenMember.BLOCK] = [];
      section[TokenMember.ELSE_BLOCK] = null; // Padding?
      break;
    // Switch to section's else-block
    case TokenType.ELSE:
      // Get entered section
      // eslint-disable-next-line no-cond-assign
      section = (sectionsLength = sections.length) ?
        sections[sectionsLength - 1]
        :
        void 0x95E2 // Reset
      ;

      value = token_[TokenMember.VALUE];

      if (!section ||
        // `ELSE` are valid for `IF`, invalid for `NOT`
        section[TokenMember.TYPE] !== TokenType.IF ||
        value !== section[TokenMember.VALUE][NameMember.NAME]
      )
        throw new Error(`Unexpected token '<type=${TokenTypeReverseMap[type_]}, value=${value}>'`);

      // Initialize and switch to section's else-block
      collector = section[TokenMember.ELSE_BLOCK] = [];
      break;
    // Leave a section
    case TokenType.END:
      section = sections.pop();
      value = token_[TokenMember.VALUE];

      if (!section ||
        value !== section[TokenMember.VALUE][NameMember.NAME]
      )
        throw new Error(`Unexpected token '<type=${TokenTypeReverseMap[type_]}, value=${value}>'`);

      // Change type for which section contains initialized else-block
      if (section[TokenMember.ELSE_BLOCK])
        section[TokenMember.TYPE] = TokenType.ELSE;

      // Re-bind block to parent block
      // eslint-disable-next-line no-cond-assign
      collector = (sectionsLength = sections.length) ?
        // Is parent section has initialized else-block?
        (section = sections[sectionsLength - 1]
        , elseBlock = section[TokenMember.ELSE_BLOCK] as Token[]
        ) ?
          // Yes, then parent block is else-block
          elseBlock
          :
          // No, then parent block is (if-)block
          section[TokenMember.BLOCK]
        :
        treeRoot;
      break;
    // Formatter
    case TokenType.RAW:
    case TokenType.FORMAT:
      token = processToken(token_);
      collector.push(token);
      break;
    // Text or Partial
    default:
      collector.push(token_);
      break;
    }
  }

  if (sections.length) {
    section = sections.pop() as Section;

    throw new Error(`No matching section '<type=${
      TokenTypeReverseMap[section[TokenMember.TYPE]]}, value=${section[TokenMember.VALUE][NameMember.NAME]}>'`);
  }

  return treeRoot;
}

export function parse(source: string, prefix: string = '{', suffix: string = '}'): Renderer {
  const treeRoot = buildTree(tokenize(
    source, prefix, suffix
  ));

  return new Renderer(treeRoot);
}
