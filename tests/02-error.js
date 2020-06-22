expectedError(() => IJ2TPL.parse('{@tpl}').render(null), "Cannot resolve partial 'tpl'");
expectedError(() => IJ2TPL.parse('{@tpl2}').render({}, {}), "Cannot resolve partial 'tpl2'");
