var cls = require('../Common/class');
var fs = require('fs');
var Server = require('./Server');
var events = require('events');
var util = require('util');
    
module.exports = Main = cls.Class.extend({
    init: function(configPath)
    {
        this.config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        this.events = new events.EventEmitter();
    },
    StartServer: function ()
    {     
        var self = this;
        this.server = new Server(this.config);
        this.events.emit('ServerStarted', this.server);
    },
    Server: function ()
    {
        return this.server;
    },
    Events: function()
    {
        return this.events;
    },
    OnServerStarted: function(asker, callback)
    {
        asker.Events().on('ServerStarted', callback);
    }
});