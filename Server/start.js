(function(){
    var _ = require("underscore");
    var Main = require('./Main');
    var main = new Main('./AppConfig.json');
    //main.Events().on('ServerStarted', function(server){console.log(server.Welcome())});
    main.OnServerStarted(main, function(server){console.log(server.Welcome())});
    main.StartServer();
    main.Server().Run();
})();