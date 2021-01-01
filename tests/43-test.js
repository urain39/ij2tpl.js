let template = IJ2TPL.parse(`\
{?contents}
    类型：{type}
    名称：{name}
    {@^}
{/contents}
`);

let data = {
	"contents": [
		{
			"type": "file",
			"name": "file1"
		},
		{
			"type": "directory",
			"name": "directory1",
			"contents": [
				{
					"type": "file",
					"name": "file2"
				}
			]
		}
	]
};

expected(template.render(data), `\
    类型：file
    名称：file1
    类型：directory
    名称：directory1
        类型：file
        名称：file2
`);
