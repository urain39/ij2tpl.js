expectedError(() => IJ2TPL.parse('{?i}'), "No matching section '<type=?, value=i>'");
expectedError(() => IJ2TPL.parse('{!i}'), "No matching section '<type=!, value=i>'");
expectedError(() => IJ2TPL.parse('{?i}{/j}'), "Unexpected token '<type=/, value=j>'");
expectedError(() => IJ2TPL.parse('{?i}{*i}'), "No matching section '<type=?, value=i>'");
expectedError(() => IJ2TPL.parse('{?i}{*j}'), "Unexpected token '<type=*, value=j>'");
expectedError(() => IJ2TPL.parse('{?i}{*i}{/j}'), "Unexpected token '<type=/, value=j>'");
expectedError(() => IJ2TPL.parse('{/i}'), "Unexpected token '<type=/, value=i>'");

expectedError(() => IJ2TPL.parse('{?ijk}'), "No matching section '<type=?, value=ijk>'");
expectedError(() => IJ2TPL.parse('{!ijk}'), "No matching section '<type=!, value=ijk>'");
expectedError(() => IJ2TPL.parse('{?ijk}{/jkl}'), "Unexpected token '<type=/, value=jkl>'");
expectedError(() => IJ2TPL.parse('{?ijk}{*ijk}'), "No matching section '<type=?, value=ijk>'");
expectedError(() => IJ2TPL.parse('{?ijk}{*jkl}'), "Unexpected token '<type=*, value=jkl>'");
expectedError(() => IJ2TPL.parse('{?ijk}{*ijk}{/jkl}'), "Unexpected token '<type=/, value=jkl>'");
expectedError(() => IJ2TPL.parse('{/ijk}'), "Unexpected token '<type=/, value=ijk>'");
