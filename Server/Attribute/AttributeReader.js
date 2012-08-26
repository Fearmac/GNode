var cls = require('../../Common/class');
var _ = require('underscore');
    
module.exports = AttributeReader = cls.Class.extend({    
    init: function()
    {
    },
    GetAttributes: function(classType)
    {    
        var arr = arguments[0].toString().split("@["),arr_annot={},i,j,tmp={};
        for(i=0;i<arr.length;i++){
            console.log(arguments);
            /*if(arr[i][0]=="-"){
                arr_annot[arr[i].split("-")[1]] ={};
                tmp = arr[i].split("-")[2].split(",");
                tmp[0]=tmp[0].replace(/\n/g,"").replace(/\r/g,"").replace(/^\s+|\s+$/,"");
                tmp[1]=tmp[1].replace(/\n/g,"").replace(/\r/g,"").replace(/^\s+|\s+$/,"");
                        
                for(j=0;j<tmp.length;j++){
                    arr_annot[arr[i].split("-")[1]][tmp[j].split(":")[0]]=
                    tmp[j].split(":")[1].replace(/\n/g,"").replace(/\r/g,"").replace(/^\s+|\s+$/,"");
                }
            }*/
        }
        //return arr_annot;
    }
});