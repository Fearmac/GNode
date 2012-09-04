var cls = require('../../Common/class');
var _ = require('underscore');
var Attribute = require('./Attribute');
var StringHelpers = require('../../Common/StringHelpers');
    
module.exports = ACLAttribute = Attribute.extend({    
    init: function(rank)
    {
        var strH = new StringHelpers();
        this.rank = strH.StartsWith(rank.toString(), "\"") ? rank.substr(1) : rank.toString();
        this.rank = strH.EndsWith(this.rank.toString(), "\"") ? this.rank.substr(0, this.rank.length-1) : this.rank.toString();
    },
    GetRank: function()
    {
        return this.rank;
    }
});