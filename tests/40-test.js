let template = IJ2TPL.parse(`\
{?contens}
    {- _.recursionDepth | toIndentaion}类型：{type}
    {- _.recursionDepth | toIndentaion}名称：{name}
    {-}{@^}
{/contens}
`);

expected(template.render({
	"contens": [
		{
			"type": "file",
			"name": "file1"
		},
		{
			"type": "directory",
			"name": "directory1",
			"contens": [
				{
					"type": "file",
					"name": "file2"
				}
			]
		}
	]
}), `\
类型：file
名称：file1
类型：directory
名称：directory1
类型：file
名称：file2
`);
