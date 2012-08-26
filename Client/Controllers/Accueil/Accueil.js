var Controller = require('../../../Common/ControllerBase');
var _ = require('underscore');
    
module.exports = Accueil = Controller.extend({
    /*[ACL("Guest")]*/
    init: function()
    {
    },
    /*[ACL("Guest")]*/
    /*[ACL("Guest")]*/
    Index: function(/*[ACL("Guest")]*/ prout, /*[ACL("Guest")]*/ plop)
    {
        return "Accueil";
    }
});