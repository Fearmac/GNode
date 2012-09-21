var Controller = require('../../../Common/ControllerBase');
var _ = require('underscore');
    
module.exports = Accueil = Controller.extend({
    init: function(urlContext)
    {
        this._super(urlContext);
    },
    /*[ACL("Guest")]*/
    Index: function()
    {
        var get = this.$_GET;
        return "<link href=\"/Resources/css/style.css\" rel=\"stylesheet\" type=\"text/css\" /><span id=\"test\">Accueil</span>";
    },
    /*[ACL("Admin")]*/
    Plop: function()
    {
        var get = this.$_GET;
        return "<audio src=\"/Resources/audio/menu.mp3\"  controls=\"controls\">&lt;audio&gt; non supportée !</audio>";
    }
});