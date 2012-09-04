var cls = require('../../Common/class');
var _ = require('underscore');
    
module.exports = AttributeReader = cls.Class.extend({    
    init: function()
    {
    },
    GetAttributes: function(classFileContent)
    {
        var regex = /\/\*\[([a-zA-Z0-9\_]+)\((.+)\)\]\*\//gm;
        return classFileContent.match(regex);
    },
    GetSpecificAttributes: function(classFileContent, attribute)
    {
        var allAttributes = this.GetAttributes(classFileContent);
        return allAttributes;
    }
});