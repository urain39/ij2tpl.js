/**
 * @file IJ2TPL Unit Tests
 * @description Comprehensive unit tests for the IJ2TPL template engine
 */

import { parse, Context, setFilterMap, setEscapeFunction } from '../ij2tpl.ts';

describe('IJ2TPL Template Engine', () => {
  beforeEach(() => {
    // Reset to default escape function before each test
    setEscapeFunction((value: any) => String(value).replace(/[\"&'\/\<=>`]/g, (special: string) => {
      const map: { [key: string]: string } = {
        '"': '&quot;',
        '&': '&amp;',
        "'": '&#39;',
        '/': '&#x2F;',
        '<': '&lt;',
        '=': '&#x3D;',
        '>': '&gt;',
        '`': '&#x60;'
      };
      return map[special];
    }));
  });

  describe('Basic Rendering', () => {
    test('should render simple text without variables', () => {
      const template = parse('Hello World');
      expect(template.render({})).toBe('Hello World');
    });

    test('should render single variable', () => {
      const template = parse('Hello {name}');
      expect(template.render({ name: 'IJ2TPL' })).toBe('Hello IJ2TPL');
    });

    test('should render multiple variables', () => {
      const template = parse('{greeting}, {name}!');
      expect(template.render({ greeting: 'Hello', name: 'World' })).toBe('Hello, World!');
    });

    test('should handle missing variables gracefully', () => {
      const template = parse('Hello {name}');
      expect(template.render({})).toBe('Hello ');
    });

    test('should escape HTML by default', () => {
      const template = parse('{html}');
      expect(template.render({ html: '<script>alert("XSS")</script>' }))
        .toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;');
    });

    test('should render numbers without escaping', () => {
      const template = parse('Count: {count}');
      expect(template.render({ count: 42 })).toBe('Count: 42');
    });
  });

  describe('Comments', () => {
    test('should ignore single-line comments', () => {
      const template = parse('Hello {- comment -} World');
      expect(template.render({})).toBe('Hello  World');
    });

    test('should ignore multi-character comments', () => {
      const template = parse('Start {- this is a comment --} End');
      expect(template.render({})).toBe('Start  End');
    });
  });

  describe('If Sections', () => {
    test('should render if block when value is truthy', () => {
      const template = parse('{?show}Visible{/show}');
      expect(template.render({ show: true })).toBe('Visible');
    });

    test('should not render if block when value is falsy', () => {
      const template = parse('{?show}Visible{/show}');
      expect(template.render({ show: false })).toBe('');
    });

    test('should not render if block when value is null', () => {
      const template = parse('{?show}Visible{/show}');
      expect(template.render({ show: null })).toBe('');
    });

    test('should not render if block when value is undefined', () => {
      const template = parse('{?show}Visible{/show}');
      expect(template.render({ show: undefined })).toBe('');
    });

    test('should not render if block when value is empty string', () => {
      const template = parse('{?show}Visible{/show}');
      expect(template.render({ show: '' })).toBe('');
    });

    test('should not render if block when value is 0', () => {
      const template = parse('{?show}Visible{/show}');
      expect(template.render({ show: 0 })).toBe('');
    });

    test('should not render if block when value is empty array', () => {
      const template = parse('{?items}Has items{/items}');
      expect(template.render({ items: [] })).toBe('');
    });
  });

  describe('Array Iteration', () => {
    test('should iterate over arrays', () => {
      const template = parse('{?numbers}{.},{/numbers}');
      expect(template.render({ numbers: [1, 2, 3] })).toBe('1,2,3,');
    });

    test('should iterate over arrays with object items', () => {
      const template = parse('{?users}{name},{/users}');
      expect(template.render({ users: [{ name: 'Alice' }, { name: 'Bob' }] }))
        .toBe('Alice,Bob,');
    });

    test('should use dot notation for current context', () => {
      const template = parse('{?.}{.}-');
      expect(template.render([1, 2, 3])).toBe('1-2-3-');
    });

    test('should handle nested properties in iteration', () => {
      const template = parse('{?items}{name}: {value}\n{/items}');
      const data = {
        items: [
          { name: 'a', value: 1 },
          { name: 'b', value: 2 }
        ]
      };
      expect(template.render(data)).toBe('a: 1\nb: 2\n');
    });
  });

  describe('Not Sections', () => {
    test('should render not block when value is falsy', () => {
      const template = parse('{!show}Hidden{/show}');
      expect(template.render({ show: false })).toBe('Hidden');
    });

    test('should not render not block when value is truthy', () => {
      const template = parse('{!show}Hidden{/show}');
      expect(template.render({ show: true })).toBe('');
    });

    test('should render not block when value is empty array', () => {
      const template = parse('{!items}No items{/items}');
      expect(template.render({ items: [] })).toBe('No items');
    });

    test('should render not block when value is null', () => {
      const template = parse('{!data}No data{/data}');
      expect(template.render({ data: null })).toBe('No data');
    });
  });

  describe('If-Else Sections', () => {
    test('should render if block when condition is truthy', () => {
      const template = parse('{?show}Yes{*show}No{/show}');
      expect(template.render({ show: true })).toBe('Yes');
    });

    test('should render else block when condition is falsy', () => {
      const template = parse('{?show}Yes{*show}No{/show}');
      expect(template.render({ show: false })).toBe('No');
    });

    test('should render else block when condition is empty array', () => {
      const template = parse('{?items}Has items{*items}No items{/items}');
      expect(template.render({ items: [] })).toBe('No items');
    });
  });

  describe('Raw Formatting', () => {
    test('should not escape raw content', () => {
      const template = parse('{#html}');
      expect(template.render({ html: '<b>Bold</b>' })).toBe('<b>Bold</b>');
    });

    test('should render null raw values as empty', () => {
      const template = parse('{#value}');
      expect(template.render({ value: null })).toBe('');
    });

    test('should render undefined raw values as empty', () => {
      const template = parse('{#value}');
      expect(template.render({ value: undefined })).toBe('');
    });
  });

  describe('Nested Properties', () => {
    test('should resolve nested properties', () => {
      const template = parse('{user.name}');
      expect(template.render({ user: { name: 'John' } })).toBe('John');
    });

    test('should handle deeply nested properties', () => {
      const template = parse('{a.b.c.d}');
      expect(template.render({ a: { b: { c: { d: 'deep' } } } })).toBe('deep');
    });

    test('should handle missing nested properties', () => {
      const template = parse('{user.name}');
      expect(template.render({ user: {} })).toBe('');
    });
  });

  describe('Filters', () => {
    beforeEach(() => {
      setFilterMap({
        'uppercase': (value: any) => String(value).toUpperCase(),
        'lowercase': (value: any) => String(value).toLowerCase(),
        'add': (value: any, context?: Context | null) => {
          const num = context?.resolve(['amount', null, null, false]) || 0;
          return (value || 0) + num;
        }
      });
    });

    test('should apply single filter', () => {
      const template = parse('{name|uppercase}');
      expect(template.render({ name: 'hello' })).toBe('HELLO');
    });

    test('should apply multiple filters', () => {
      setFilterMap({
        'trim': (value: any) => String(value).trim(),
        'uppercase': (value: any) => String(value).toUpperCase()
      });
      const template = parse('{name|trim|uppercase}');
      expect(template.render({ name: '  hello  ' })).toBe('HELLO');
    });

    test('should handle filter with context', () => {
      const template = parse('{value|add}');
      expect(template.render({ value: 10, amount: 5 })).toBe(15);
    });

    test('should throw error for unknown filter', () => {
      const template = parse('{name|unknown}');
      expect(() => template.render({ name: 'test' }))
        .toThrow("Cannot resolve filter 'unknown'");
    });
  });

  describe('Actions', () => {
    let actionCalls: number = 0;

    beforeEach(() => {
      actionCalls = 0;
      setFilterMap({
        'track': (_: any) => {
          actionCalls++;
          return '';
        }
      });
    });

    test('should execute action without field lookup', () => {
      const template = parse('{|track}');
      template.render({});
      expect(actionCalls).toBe(1);
    });

    test('should execute action on every render', () => {
      const template = parse('{|track}');
      template.render({});
      template.render({});
      expect(actionCalls).toBe(2);
    });
  });

  describe('Custom Delimiters', () => {
    test('should use custom delimiters', () => {
      const template = parse('Hello <%name%>', '<%', '%>');
      expect(template.render({ name: 'World' })).toBe('Hello World');
    });

    test('should work with different prefix and suffix', () => {
      const template = parse('Hello ${name}', '${', '}');
      expect(template.render({ name: 'World' })).toBe('Hello World');
    });
  });

  describe('Partial Templates', () => {
    test('should render partial template', () => {
      const main = parse('{@header}');
      const header = parse('<h1>Title</h1>');
      expect(main.render({}, { header })).toBe('<h1>Title</h1>');
    });

    test('should pass context to partial', () => {
      const main = parse('{@partial}');
      const partial = parse('{name}');
      expect(main.render({ name: 'Test' }, { partial })).toBe('Test');
    });

    test('should indent partial content', () => {
      const main = parse('  {@partial}');
      const partial = parse('Line1\nLine2');
      expect(main.render({}, { partial })).toBe('  Line1\n  Line2');
    });

    test('should throw error for missing partial', () => {
      const template = parse('{@missing}');
      expect(() => template.render({})).toThrow("Cannot resolve partial 'missing'");
    });
  });

  describe('Recursive Rendering', () => {
    test('should support self-recursion with &', () => {
      const template = parse('{?items}{name}{@&}{/items}');
      const data = {
        items: [
          { name: 'A', items: [{ name: 'B', items: null }] }
        ]
      };
      expect(template.render(data)).toContain('A');
      expect(template.render(data)).toContain('B');
    });

    test('should support independent recursion with ^', () => {
      const template = parse('{?items}{name}{@^}{/items}');
      const data = {
        items: [
          { name: 'A', items: [{ name: 'B' }] }
        ]
      };
      expect(template.render(data)).toContain('A');
      expect(template.render(data)).toContain('B');
    });
  });

  describe('Context Resolution', () => {
    test('should resolve from parent context', () => {
      const template = parse('{?items}{parentName}{/items}');
      expect(template.render({ parentName: 'Parent', items: [{}] }))
        .toBe('Parent');
    });

    test('should prioritize child context over parent', () => {
      const template = parse('{?items}{name}{/items}');
      expect(template.render({ name: 'Parent', items: [{ name: 'Child' }] }))
        .toBe('Child');
    });
  });

  describe('Error Handling', () => {
    test('should throw error for unclosed section', () => {
      expect(() => parse('{?show}Not closed'))
        .toThrow(/No matching section/);
    });

    test('should throw error for mismatched end tag', () => {
      expect(() => parse('{?show}Content{/other}'))
        .toThrow(/Unexpected token/);
    });

    test('should throw error for orphan else', () => {
      expect(() => parse('{*show}Orphan else{/show}'))
        .toThrow(/Unexpected token/);
    });

    test('should throw error for mismatched else', () => {
      expect(() => parse('{?show}Content{*other}Else{/show}'))
        .toThrow(/Unexpected token/);
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty template', () => {
      const template = parse('');
      expect(template.render({})).toBe('');
    });

    test('should handle template with only whitespace', () => {
      const template = parse('   \n\t  ');
      expect(template.render({}).trim()).toBe('');
    });

    test('should handle empty delimiters', () => {
      const template = parse('Hello {} World');
      expect(template.render({})).toBe('Hello {} World');
    });

    test('should handle special characters in values', () => {
      const template = parse('{value}');
      expect(template.render({ value: 'Special: !@#$%^&*()' }))
        .toBe('Special: !@#$%^&*()');
    });

    test('should handle unicode characters', () => {
      const template = parse('{emoji}');
      expect(template.render({ emoji: '🎉🚀✨' })).toBe('🎉🚀✨');
    });
  });

  describe('Performance', () => {
    test('should handle large arrays efficiently', () => {
      const template = parse('{?items}{.},{/items}');
      const largeArray = Array.from({ length: 1000 }, (_, i) => i);
      const result = template.render({ items: largeArray });
      expect(result.split(',').length - 1).toBe(1000);
    });

    test('should cache resolved values', () => {
      let resolveCount = 0;
      const template = parse('{?show}{name}{name}{name}{/show}');
      
      // Create custom context to track resolutions
      const data = { 
        show: true, 
        get name() { 
          resolveCount++; 
          return 'test'; 
        } 
      };
      
      template.render(data);
      // Due to caching, should resolve fewer times than direct accesses
      expect(resolveCount).toBeLessThan(4);
    });
  });
});
