var IJ2TPL = require('../dist/ij2tpl.min');

let source = `\
{?tasks}
<li class="task" id="task-gid-{gid}" data-status="{status}" data-gid="{gid}" data-infohash="{infoHash}">
	<div class="left-area">
		<div class="task-name">
			<i class="select-box"></i>
			<span title="{title}">{title}</span>
		</div>
	</div>
	<div class="right-area">
		<div class="task-info pull-left">
			<span class="task-status" title="{?_v.status_text}{status}{/_v.status_text}{?_v.error_msg}{errorCode}{/_v.error_msg}"><i class="{?_v.status_icon}{status}{/_v.status_icon}"></i></span>
			<span>{?_v.format_size}{totalLength}{/_v.format_size}</span>
			{?uploadLength}<span>(up {?_v.format_size}{uploadLength}{/_v.format_size})</span>{/uploadLength}
		</div>
		<div class="pull-right">
			<div class="progress">
				<div class="bar" style="width:{progress}%;"> </div>
				<div class="bar tex">{progress}%</div>
			</div>
		</div>
		<div class="clearfix"></div>
	</div>
</li>
{*tasks}
<li>
	<div class="empty-tasks">
		<strong>没有正在下载的任务</strong>
	</div>
</li>
{/tasks}`;

let tpl = IJ2TPL.parse(source);

if (tpl.render({names: ['uzilla', 'urain39']}) === `
<li>
	<div class="empty-tasks">
		<strong>没有正在下载的任务</strong>
	</div>
</li>
`)
	console.log(`${__filename}: PASS`);
else
	console.log(`${__filename}: FAIL`);
