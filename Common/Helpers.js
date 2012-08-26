var cls = require('./class');
var _ = require('underscore');
    
module.exports = Helpers = cls.Class.extend({    
    init: function()
    {
    },
    Reflect: function(obj) {
         //regex that match attributes: (\/\*\[(\w+)\((".*")?|('.*')?\)\]\*\/)
            return true;
    },
    GetFuncMeta: function()
    {
        return this.func;
    },
    GetArgsMeta: function()
    {
        return this.args;
    },
    ParseMetaTags: function(metadata) {
        var tags = metadata.match(/\[(.*?)\]/g)
        , restult = {};
 
        if(!tags) {
            return false;
        }
 
        for(var i in tags) {
            var str = tags[i]
            , len = str.indexOf('{')
            , tag = str.substring(str.indexOf('') + 1,
                (len != -1 ? len : str.length - 1))
            , details = (len == -1 ? true :
                eval('(' + str.substring(len, str.length - 1) + ')'));
            restult[tag] = details;
        }
 
        return restult;
    }
});