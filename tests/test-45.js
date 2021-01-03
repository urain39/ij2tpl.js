// NOTE: This is a bug from the v0.1.0
// See https://github.com/urain39/ij2tpl.js/issues/267

IJ2TPL.parse('{?.} {-}{/.}');
IJ2TPL.parse(`{?settings}{?account} {-}{?username} {username} {/username}{-} {?password} {password} {/password} {/account}{/settings}`);
IJ2TPL.parse(`\
{?settings}
	{?account}
		{-}{?username}{username}{/username}
		{-}{?password}{password}{/password}
	{/account}
{/settings}
`);
