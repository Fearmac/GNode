var cls = require('./class');
var _ = require('underscore');
    
module.exports = ControllerBase = cls.Class.extend({    
    init: function()
    {
    },
    Display: function(message)
    {
        return message;
    }
});