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

console.log(tpl.render({tasks: [{
	gid: 0xdeadbeef,
	status: 'offline',
	title: 'DEAD BEEF',
	totalLength: 0xffff,
	uploadLength: 0xdead,
	_v: {
		format_size: 0xBEEF,
		status_icon: 'i_offline'
	},
	progress: 86,
	infoHash: 0xDEEF,
},
{
	gid: 0x8BADF00D,
	status: 'online',
	title: 'ATE BAD FOOD',
	totalLength: 0xffff,
	uploadLength: 0x8BAD,
	_v: {
		format_size: 0xF00D,
		status_icon: 'i_online'
	},
	progress: 92,
	infoHash: 0x8B0D
}]}));
