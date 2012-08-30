var cls = require('./class');
var _ = require('underscore');
    
module.exports = ControllerBase = cls.Class.extend({    
    init: function(urlContext)
    {
        this.$_GET = urlContext.$_GET();
    },
    Display: function(message)
    {
        return message;
    }
});