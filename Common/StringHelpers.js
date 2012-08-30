var cls = require('./class');
var _ = require('underscore');

module.exports = StringHelpers = cls.Class.extend({
    init:function () {
        if(!this instanceof StringHelpers)
            return new StringHelpers();
    },
    EndsWith: function(str, suffix)
    {
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
    },
    StartsWith: function(str, prefix)
    {
        return str.indexOf(prefix) == 0;
    },
    RemoveHTMLExtension: function(str)
    {
        return str.substr(0,str.length-".html".length);
    }
})