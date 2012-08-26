var cls = require('./class');
    
module.exports = ConsoleColors = cls.Class.extend({    
    init: function()
    {
    },
    Standard: function(str){return "\x1b[0m" + str;},
    Bright: function(str){return "\x1b[1m" + str;},
    Dim: function(str){return "\x1b[2m" + str;},
    Underscore: function(str){return "\x1b[4m" + str;},
    Blink: function(str){return "\x1b[5m" + str;},
    Reverse: function(str){return "\x1b[7m" + str;},
    Hidden: function(str){return "\x1b[8m" + str;},
    FgBlack: function(str){return "\x1b[30m" + str;},
    FgRed: function(str){return "\x1b[31m" + str;},
    FgGreen: function(str){return "\x1b[32m" + str;},
    FgYellow: function(str){return "\x1b[33m" + str;},
    FgBlue: function(str){return "\x1b[34m" + str;},
    FgMagenta: function(str){return "\x1b[35m" + str;},
    FgCyan: function(str){return "\x1b[36m" + str;},
    FgWhite: function(str){return "\x1b[37m" + str;},
    BgBlack: function(str){return "\x1b[40m" + str;},
    BgRed: function(str){return "\x1b[41m" + str;},
    BgGreen: function(str){return "\x1b[42m" + str;},
    BgYellow: function(str){return "\x1b[43m" + str;},
    BgBlue: function(str){return "\x1b[44m" + str;},
    BgMagenta: function(str){return "\x1b[45m" + str;},
    BgCyan: function(str){return "\x1b[46m" + str;},
    BgWhite: function(str){return "\x1b[47m" + str;},
});

function Init()
{
    return new ConsoleColors();
}