expectedError(() => IJ2TPL.parse('{?i}'), "No matching section '<type=?, value=i>'");
expectedError(() => IJ2TPL.parse('{!i}'), "No matching section '<type=!, value=i>'");
expectedError(() => IJ2TPL.parse('{?i}{/j}'), "Unexpected token '<type=/, value=j>'");
expectedError(() => IJ2TPL.parse('{?i}{*i}'), "No matching section '<type=?, value=i>'");
expectedError(() => IJ2TPL.parse('{?i}{*j}'), "Unexpected token '<type=*, value=j>'");
expectedError(() => IJ2TPL.parse('{?i}{*i}{/j}'), "Unexpected token '<type=/, value=j>'");
expectedError(() => IJ2TPL.parse('{/i}'), "Unexpected token '<type=/, value=i>'");
