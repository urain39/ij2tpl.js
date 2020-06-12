expectedError(() => IJ2TPL.parse('{'), "No matching prefix '{'");
expectedError(() => IJ2TPL.parse('<%', '<%'), "No matching prefix '<%'");
expectedError(() => IJ2TPL.parse('<%', '<%', '%>'), "No matching prefix '<%'");
expectedError(() => IJ2TPL.parse('<%ij', '<%', '%>'), "No matching prefix '<%'");
expectedError(() => IJ2TPL.parse('<%ij2%', '<%', '%>'), "No matching prefix '<%'");
