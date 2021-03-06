var cls = require('../Common/class');
var _ = require('underscore');
var fs = require('fs');
var url = require('url');
var ConsoleColors = require('../Common/ConsoleColors');
var StringHelpers = require('../Common/StringHelpers');
var UrlContext = require('../Common/UrlContext.js');
var AttributeReader = require('./Attribute/AttributeReader.js');
    
module.exports = WebRouter = cls.Class.extend({    
    init: function(config)
    {
        this.consoleColors = new ConsoleColors();
        this.configServer = config;
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
        //If current url is the website root
        if (req.url == "/"){
            var defaultFile = publicDirectory + '/Controllers/' + defaultRoute.Controllers + '/' + defaultRoute.Controllers + '.js';

            fs.exists(defaultFile, function (exists) {
                if (!exists)
                {
                    console.log(self.consoleColors.FgRed("Error: ") + self.consoleColors.Standard(publicDirectory + '/Controllers/' + defaultRoute.Controllers + '/' + defaultRoute.Controllers + '.js doesn\'t exist'));
                } 
                else 
                {
                    var Controller = require(defaultFile);
                    var ctr = new Controller(new UrlContext());
                    self.CheckACL(defaultFile, defaultRoute.Action, function(allowed){
                        if(!allowed)
                            self.RenderHtml(res, ctr.Display("You are not allowed to be there"));
                        else
                        {
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
            }); 
        }
        //If current url isn't the website root we have to choose the right route
        else if(req.url != "/" && strH.EndsWith(url.parse(req.url).pathname, '.html'))
        {
            var urlWithoutRoot = req.url.substr(1,req.url.length);
            //verifie si l'url se termine par html
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
            fs.exists(fileToRender, function (exists) {
                if(exists)
                {
                    var Controller = require(fileToRender);
                    var ctr = new Controller(urlContext);
                    self.CheckACL(fileToRender, action, function(allowed){
                        if(!allowed)
                            self.RenderHtml(res, ctr.Display("You are not allowed to be there"));
                        else
                        {
                            try
                            {
                                self.RenderHtml(res, ctr[action]());
                            }
                            catch(err)
                            {

                                self.RenderHtml(res, ctr.Display(action + ' is not a know action please check your controller action configuration'));
                            }
                        }
                    });
                }
                else
                {
                    self.ServerError(res, 404, '404 Bad Request for ' + urlWithoutRoot);
                }
            });
        }
        //if it's a static file (css, img...)
        else
        {
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
        //To get favicon
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
    CheckACL: function(fileClass, action, callBack)
    {
        var attributeReader = new AttributeReader();
        console.log(fileClass);
        fs.readFile(fileClass, 'utf-8', function (err, data) {
            var Attr = require("./Attribute/ACLAttribute.js");
            var regex = /\/\*\[(ACL)\((.+)\)\]\*\//g;
            var lines = data.toString().split("\n");
            var acl;
            _.each(lines, function(value, key, lines){
                value = value.toString().replace(/(\r\n|\n|\r)/gm,"");
                // test if the value is an attribute
                if(value.match(regex))
                {
                    var val = regex.exec(value);
                    // after regex execution, test if the value array isn't null
                    if(!_.isNull(val))
                    {
                        //now we need to get the function related to the attribute
                        var index = key;
                        var functionDefined = null;
                        var functionFinder = /([A-Z]{1}[a-zA-Z0-9]+): function\(/g;
                        //while we can't match any function we iterate and then we'll have the line index of the function
                        while(!lines[index].match(functionFinder))index++;
                        if(!_.isNull(lines[index]))
                        {
                            //we can get the function with the above method:
                            var currentFunction = functionFinder.exec(lines[index])[1];

                            //we need to test if the action match the function
                            if(currentFunction == action)
                            {
                                var param;
                                if(!_.isNull(val[2]))
                                {
                                    param = val[2];
                                }
                                acl = new Attr(param);
                            }
                        }
                    }
                }
            });
            //TODO i need to check current user rank and compare it to the called function and then return true or false
            // i must not forget to change the above admin string to get the default rank from DB
            if(_.isUndefined(acl)) acl = new Attr("Admin");
            callBack(acl.GetRank() == "Admin");
        });
    },
    getHeadersByFileExtension : function(extension) {
        var self = this;
        var headers = {};

        switch (extension) {
            case 'css':
                headers['Content-Type'] = 'text/css';
                break;
            case 'csv':
                headers['Content-Type'] = 'text/csv';
                break;
            case 'html':
                headers['Content-Type'] = 'text/html';
                break;
            case 'txt':
                headers['Content-Type'] = 'text/plain';
                break;
            case 'xml':
                headers['Content-Type'] = 'text/xml';
                break;
            case 'mpeg':
                headers['Content-Type'] = 'video/mpeg';
                break;
            case 'mpg':
                headers['Content-Type'] = 'video/mpeg';
                break;
            case 'mp4':
                headers['Content-Type'] = 'video/mp4';
                break;
            case 'mov':
                headers['Content-Type'] = 'video/quicktime';
                break;
            case 'wmv':
                headers['Content-Type'] = 'video/x-ms-wmv';
                break;
            case 'p12':
                headers['Content-Type'] = 'application/x-pkcs12';
                break;
            case 'pfx':
                headers['Content-Type'] = 'application/x-pkcs12';
                break;
            case 'p7b':
                headers['Content-Type'] = 'application/x-pkcs7-certificates';
                break;
            case 'spc':
                headers['Content-Type'] = 'application/x-pkcs7-certificates';
                break;
            case 'p7r':
                headers['Content-Type'] = 'application/x-pkcs7-certreqresp';
                break;
            case 'p7c':
                headers['Content-Type'] = 'application/x-pkcs7-mime';
                break;
            case 'p7m':
                headers['Content-Type'] = 'application/x-pkcs7-mime';
                break;
            case 'p7s':
                headers['Content-Type'] = 'application/x-pkcs7-signature';
                break;
            case 'js':
                headers['Content-Type'] = 'application/javascript';
                break;
            case 'ogg':
                headers['Content-Type'] = 'application/ogg';
                break;
            case 'pdf':
                headers['Content-Type'] = 'application/pdf';
                break;
            case 'xhtml':
                headers['Content-Type'] = 'application/xhtml+xml';
                break;
            case 'dtd':
                headers['Content-Type'] = 'application/xml-dtd';
                break;
            case 'json':
                headers['Content-Type'] = 'application/json';
                break;
            case 'zip':
                headers['Content-Type'] = 'application/zip';
                break;
            case 'gif':
                headers['Content-Type'] = 'image/gif';
                break;
            case 'jpeg':
                headers['Content-Type'] = 'image/jpeg';
                break;
            case 'jpg':
                headers['Content-Type'] = 'image/jpeg';
                break;
            case 'png':
                headers['Content-Type'] = 'image/png';
                break;
            case 'svg':
                headers['Content-Type'] = 'image/svg+xml';
                break;
            case 'tiff':
                headers['Content-Type'] = 'image/tiff';
                break;
            case 'ico':
                headers['Content-Type'] = 'image/vnd.microsoft.icon';
                break;
            case 'odt':
                headers['Content-Type'] = 'application/vnd.oasis.opendocument.text';
                break;
            case 'ods':
                headers['Content-Type'] = 'application/vnd.oasis.opendocument.spreadsheet';
                break;
            case 'odp':
                headers['Content-Type'] = 'application/vnd.oasis.opendocument.presentation';
                break;
            case 'odg':
                headers['Content-Type'] = 'application/vnd.oasis.opendocument.graphics';
                break;
            case 'xls':
                headers['Content-Type'] = 'application/vnd.ms-excel';
                break;
            case 'xlsx':
                headers['Content-Type'] = 'application/vnd.ms-excel';
                break;
            case 'ppt':
                headers['Content-Type'] = 'application/vnd.ms-powerpoint';
                break;
            case 'pptx':
                headers['Content-Type'] = 'application/vnd.ms-powerpoint';
                break;
            case 'doc':
                headers['Content-Type'] = 'application/msword';
                break;
            case 'docx':
                headers['Content-Type'] = 'application/msword';
                break;
            case 'xul':
                headers['Content-Type'] = 'application/vnd.mozilla.xul+xml';
                break;
            case 'wma':
                headers['Content-Type'] = 'audio/x-ms-wma';
                break;
            case 'rn':
                headers['Content-Type'] = 'audio/vnd.rn-realaudio';
                break;
            case 'wav':
                headers['Content-Type'] = 'audio/x-wav';
                break;
            default:
                headers['Content-Type'] = 'text/plain';
        }
        return headers;
    }
});