expectedError(() => IJ2TPL.parse('{@tpl}').render(null), "Cannot resolve partial template 'tpl'");
expectedError(() => IJ2TPL.parse('{@tpl2}').render({}, {}), "Cannot resolve partial template 'tpl2'");
