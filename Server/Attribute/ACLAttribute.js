var cls = require('../../Common/class');
var _ = require('underscore');
var Attribute = require('./Attribute');
    
module.exports = ACLAttribute = Attribute.extend({    
    init: function()
    {
    },
    SetRank: function(rank)
    {
        console.log(rank);
    }
});