var cls = require('../Common/class');
var _ = require('underscore');
var fs = require('fs');
var util = require('util');
var ConsoleColors = require('../Common/ConsoleColors');
var Helpers = require('../Common/Helpers');
    
module.exports = WebRouter = cls.Class.extend({    
    init: function(config)
    {
        this.consoleColors = new ConsoleColors();
        this.configServer = config;
        this.actions = {
            'view' : function(user) 
            {
                return '<h1>Todos for ' + user + '</h1>';
            }
        }
    },
    RenderHtml: function(res, content) 
    {
        res.writeHead(200, 
            {
                'Content-Type': 'text/html'
            });
        res.end(content, 'utf-8');
    },
        
    ServerError: function(res, code, content) 
    {
        res.writeHead(code, 
        {
            'Content-Type': 'text/plain'
        });
        res.end(content);
    },
    Routes: function(req, res)
    {
        var self = this;
 
        var parts = req.url.split('/');
 
        if (req.url == "/") 
        {
            //Si l'adresse fournie est l'adresse root du site
            var defaultRoute = self.configServer.routes.defaultRoute.defaultValue;
            var publicDirectory = '../' + self.configServer[self.configServer["mode"]].publicDirectory;
            var defaultFile = publicDirectory + '/Controllers/' + defaultRoute.controller + '/' + defaultRoute.controller + '.js';
            
            fs.exists(defaultFile, function (exists) {
                if (!exists)
                {
                    console.log(self.consoleColors.FgRed("Error: ") + self.consoleColors.Standard(publicDirectory + '/Controllers/' + defaultRoute.controller + '/' + defaultRoute.controller + '.js doesn\'t exist'));   
                } 
                else 
                {
                    var Controller = require(defaultFile);
                    var ctr = new Controller();
                    self.CheckACL(ctr);
                    try
                    {
                        self.RenderHtml(res, ctr[defaultRoute.action]());
                    }
                    catch(err)
                    {
                        self.RenderHtml(res, ctr.Display(defaultRoute.action + ' is not a know action from ' + defaultRoute.controller + ' please check your route "defaultRoute" action configuration'));
                    }
                }
            }); 
        } 
        else 
        {
            //si l'adresse fournie n'est pas l'adresse root, il faut déterminer la bonne route à suivre
            //TODO
            var action   = parts[1];
            var argument = parts[2];
 
            if (typeof self.actions[action] == 'function') 
            {
                var content = self.actions[action](argument);
                self.RenderHtml(res, content);
            } 
            else 
            {
                self.ServerError(res, 404, '404 Bad Request');
            }
        }
    },
    CheckACL: function(classType)
    {
        var helpers = new Helpers();
        helpers.Reflect(classType);
        console.log(helpers.GetArgsMeta());
        console.log(helpers.GetFuncMeta());
    }
});