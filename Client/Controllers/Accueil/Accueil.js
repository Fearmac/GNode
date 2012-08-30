var Controller = require('../../../Common/ControllerBase');
var _ = require('underscore');
    
module.exports = Accueil = Controller.extend({
    /*[ACL("Guest")]*/
    init: function(urlContext)
    {
        this._super(urlContext);
    },
    /*[ACL("Guest")]*/
    /*[ACL("Guest")]*/
    Index: function(/*[ACL("Guest")]*/ prout, /*[ACL("Guest")]*/ plop)
    {
        console.log(JSON.stringify(this.$_GET));
        return "<link href=\"/Resources/css/style.css\" rel=\"stylesheet\" type=\"text/css\" /><span id=\"test\">Accueil</span>";
    }
});