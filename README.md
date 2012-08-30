GNode
=====

Route configuration
===

Route configuration is pretty simple.
You have to define all the routes you need in appConfig.json in the Server folder.
Each route is iteratively tested. If it matches, then the route is choosen.

So you have to define all your routes in the good orders. A pattern is easy to define.
Firstly you have to define the path to your files between curly brackets (for each folder).
Then you can define the default value if there is no action defined.
Watch out, you have to define your action if you need some get parameters.
you have to define a default route which is used at root.

"plop":
{
    "pattern": "{Controllers}/{View}/{BonhommeEnMousse}/{Action}/{ids}",
    "defaultValue":
    {
        "Controllers": "Accueil",
        "Action": "Index"
    }
},
"defaultRoute":
{
    "pattern": "{Controllers}/{Action}",
    "defaultValue":
    {
        "Controllers": "Accueil",
        "Action": "Index"
    }
}

Favicon
===
The favicon is defined in the root folder of your public directory.
