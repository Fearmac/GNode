var cls = require('../Common/class');
var _ = require('underscore');
var fs = require('fs');
var url = require('url');
var util = require('util');
var ConsoleColors = require('../Common/ConsoleColors');
var Helpers = require('../Common/Helpers');
var StringHelpers = require('../Common/StringHelpers');
var UrlContext = require('../Common/UrlContext.js');
    
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
        var strH = new StringHelpers();
        var self = this;
        console.log(self.consoleColors.FgGreen(req.method + ' ') + self.consoleColors.Standard(url.parse(req.url).pathname));
        var parts = req.url.split('/');

        var routes = self.configServer.routes;
        var defaultRoute = routes.defaultRoute.defaultValue;
        var publicDirectory = '../' + self.configServer[self.configServer["mode"]].publicDirectory;
        if (req.url == "/"){
            //Si l'adresse fournie est l'adresse root du site
            var defaultFile = publicDirectory + '/Controllers/' + defaultRoute.Controllers + '/' + defaultRoute.Controllers + '.js';

            console.log("defaultFile to render: " + defaultFile);
            fs.exists(defaultFile, function (exists) {
                if (!exists)
                {
                    console.log(self.consoleColors.FgRed("Error: ") + self.consoleColors.Standard(publicDirectory + '/Controllers/' + defaultRoute.Controllers + '/' + defaultRoute.Controllers + '.js doesn\'t exist'));
                } 
                else 
                {
                    var Controller = require(defaultFile);
                    var ctr = new Controller();
                    self.CheckACL(ctr);
                    try
                    {
                        self.RenderHtml(res, ctr[defaultRoute.Action]());
                    }
                    catch(err)
                    {
                        self.RenderHtml(res, ctr.Display(defaultRoute.Action + ' is not a know action from ' + defaultRoute.controller + ' please check your route "defaultRoute" action configuration'));
                    }
                }
            }); 
        }
        else if(req.url != "/" && strH.EndsWith(url.parse(req.url).pathname, '.html'))
        {
            //si l'adresse fournie n'est pas l'adresse root, il faut déterminer la bonne route à suivre
            var urlWithoutRoot = req.url.substr(1,req.url.length);
            //verifie si l'url se termine par html TODO
            //
            var urlModelParamsPattern = "{([a-zA-Z0-9]+)}";
            var urlModelParamsRegex = new RegExp(urlModelParamsPattern, 'g');

            var fileToRender = "";
            var urlContext;
            for(var r in routes)
            {
                fileToRender = publicDirectory;
                var key = r;
                var value = routes[key];
                var pattern = value.pattern.toString();
                var matches = pattern.match(urlModelParamsRegex);
                var currentUrlArray = urlWithoutRoot.split('/');
                //récupère l'ensemble des éléments composant le modèle d'url
                //ex:
                //{Controllers}/{Action} => ["Controllers", "Action"]
                var action = "";
                var actionMet = false;
                var nbrBeforeAction = matches.length-(matches.length-matches.indexOf("{Action}"))-1;
                //if(currentUrlArray.length == nbrBeforeAction)
                if(!_.isUndefined(currentUrlArray[nbrBeforeAction]))
                { // Si le pattern défini match, on rentre dans ce test
                    var ctrl = "";
                    for(var i = 0; i<=nbrBeforeAction; i++)
                    {
                        if(strH.EndsWith(currentUrlArray[i], '.html'))
                            ctrl = strH.RemoveHTMLExtension(currentUrlArray[i]);
                        else
                            ctrl = currentUrlArray[i];
                        if(i==0)
                            fileToRender += "/" + matches[i].substr(1,matches[i].length-2) + "/" + ctrl + "/" + ctrl;
                        else
                            fileToRender += "/" + ctrl;

                    }

                    var idAction = (nbrBeforeAction) + 1;
                    if(!_.isUndefined(currentUrlArray[idAction]))
                    {
                        if(strH.EndsWith(currentUrlArray[idAction], '.html'))
                            action = strH.RemoveHTMLExtension(currentUrlArray[idAction]);
                        else
                            action = currentUrlArray[idAction];
                    }
                    else
                    {
                        action = "Index";
                    }
                    //parametres GET
                    urlContext = new UrlContext();
                    for(var j = idAction+1; j<= currentUrlArray.length; j++)
                    {
                        if(!_.isUndefined(currentUrlArray[j]))
                        {
                            var key = (strH.EndsWith(currentUrlArray[j], '.html')) ? strH.RemoveHTMLExtension(currentUrlArray[j]) : currentUrlArray[j];
                            j++;
                            var value;
                            if(!_.isUndefined(currentUrlArray[j]))
                            {
                                value = (strH.EndsWith(currentUrlArray[j], '.html')) ? strH.RemoveHTMLExtension(currentUrlArray[j]) : currentUrlArray[j];
                            }
                            else
                            {
                                value = null;
                            }
                            urlContext.AddGetParameter(key, value);
                        }
                    }
                    if(!fs.existsSync(fileToRender + ".js")) continue;
                    else break;
                }
            }
            fileToRender += ".js";
            var Controller = require(fileToRender);
            var ctr = new Controller(urlContext);
            self.CheckACL(ctr);
            try
            {
                self.RenderHtml(res, ctr[action]());
            }
            catch(err)
            {
                self.ServerError(res, 404, '404 Bad Request for ' + urlWithoutRoot);
            }
        }
        else
        {
            //si le fichier recherché est un  fichier static (type css, js, autre...)
            fs.readFile(publicDirectory + url.parse(req.url).pathname, function(error, content) {
                if (error) {
                    self.ServerError(res, 404, '404 Bad Request for ' + urlWithoutRoot);
                } else {
                    var extension = (url.parse(req.url).pathname.split('.').pop());
                    res.writeHead(200, self.getHeadersByFileExtension(extension));
                    res.end(content, 'utf-8');
                }
            });
        }
        //Test spécifique à la favicon du site
        if (req.url === '/favicon.ico') {
            fs.readFile(publicDirectory + '/favicon.ico', function(error, content) {
                if (error) {
                    self.ServerError(res, 404, '404 Bad Request for ' + publicDirectory + '/favicon.ico');
                } else {
                    res.writeHead(200, self.getHeadersByFileExtension('ico') );
                    res.end(content);
                }
            });
        }
    },
    CheckACL: function(classType)
    {
        var helpers = new Helpers();
        helpers.Reflect(classType);
        //console.log(helpers.GetArgsMeta());
        //console.log(helpers.GetFuncMeta());
    },
    getHeadersByFileExtension : function(extension) {
        var self = this;
        var headers = {};

        switch (extension) {
            case 'css':
                headers['Content-Type'] = 'text/css';
                break;
            case 'js':
                headers['Content-Type'] = 'application/javascript';
                break;
            case 'ico':
                headers['Content-Type'] = 'image/x-icon';
                break;
            default:
                headers['Content-Type'] = 'text/plain';
        }
        return headers;
    }
});