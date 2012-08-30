var cls = require('./class');
var _ = require('underscore');

module.exports = UrlContext = cls.Class.extend({
    init:function () {
        this.gets = {};
    },
    $_GET: function()
    {
        return this.gets;
    },
    AddGetParameter: function(key, value)
    {
        return this.gets[key] = value;
    }
})