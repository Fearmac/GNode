var cls = require('../Common/class');
var nodeStatic = require('node-static');
var http = require('http');
var _ = require("underscore");
var sys = require("sys");
var url   = require('url');

module.exports = Server = cls.Class.extend({
    init: function(config)
    {
        this.configServer = config;
    },
    ServerName: function ()
    {
        return this.configServer["name"];
    },
    ServerConfig: function ()
    {
        return this.configServer;
    },
    Mode: function ()
    {
        return this.configServer["mode"];
    },
    Port: function ()
    {
        return this.configServer[this.Mode()]["port"];
    },
    PublicDirectory: function ()
    {
        return this.configServer[this.Mode()]["publicDirectory"];
    },
    CacheTimer: function ()
    {
        return this.configServer[this.Mode()]["cacheTimer"];
    },
    Welcome: function ()
    {
        return this.configServer["welcome"];
    },
    ErrorPath: function ()
    {
        return this.configServer["errorPath"];
    },
    Run: function()
    {
        var self = this; 
        var WebRouter = require('./WebRouter');
        var router = new WebRouter(this.configServer);
        
        http.createServer(function (req, res) 
        {
            //wrap calls in a try catch
            //or the node js server will crash upon any code errors
            try {
                //dispatch our request
                router.Routes(req, res); 

            } catch (err) {
                //handle errors gracefully
                sys.puts(err + ": " + url.parse(req.url).href);
                res.writeHead(500);
                res.end('Internal Server Error');
            }

        }).listen(self.Port());

    }    
});