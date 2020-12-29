let source2 = `\
{?a}
    {?f}
            {?g}
            {*g}
                    {-}{h}
            {/g}
    {/f}
{*a}
    {?b}
            {-}{c}
    {*b}
            {?d}
                    {-}{e}
            {/d}
    {/b}
{/a}`;

expected(JSON.stringify(IJ2TPL.parse(source2)), '{"recursionDepth":0,"treeRoot":[[2,["a",null,null,false],[[0,["f",null,null,false],[[2,["g",null,null,false],[],[[6,["h",null,null,false]],[4,"\\n"]]]],null]],[[2,["b",null,null,false],[[6,["c",null,null,false]],[4,"\\n"]],[[0,["d",null,null,false],[[6,["e",null,null,false]],[4,"\\n"]],null]]]]]]}');

// treeRoot[0] -> if-section(a)
// if-section(a)[2] -> if-block(a)
// if-block(a)[1] -> text(123)
// text(133)[1] -> "123"
expected(IJ2TPL.parse("{?a}{?b}{*b}{/b} 123 {/a}").treeRoot[0][2][1][1], ' 123 ')
