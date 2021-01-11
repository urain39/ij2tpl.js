IJ2TPL.setFilterMap({
    report: function(_, context) {
        let debugEnabled = context.resolve(['debugEnabled', null]);

        if (debugEnabled) {
            console.log('debugEnabled = true');
        }

        return '';
    }
});

IJ2TPL.parse('{|report}').render({
    debugEnabled: true
});
