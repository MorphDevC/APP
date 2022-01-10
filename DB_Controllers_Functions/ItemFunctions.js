'use strict';
const db=require('@arangodb').db;
const DBSFunctions = require('./DB_SupportFunctions');
const Logs = require("./../DB_Support_Files/LogsManager.js");
const SFn = require("./../SupportFunctions.js");
//1.3
function Returnable_Get_Item_Info(req,res)
{
    let {0:item_category,1:targetLanguage,2:item_key,...other} = req.body

    targetLanguage=SFn.GetTargetLanguageDefence(targetLanguage);
    item_category = item_category?item_category.toLowerCase():null
    const properties_collection = SFn.ReplaceWord(item_category,'category','properties')
    const doesTargetDocumentExist =  DBSFunctions.DoesDocumentExistsInTargetCollection(item_category,item_key)
    if(doesTargetDocumentExist===true)
    {
        const{0:result} = db._query(
            {
                query:`let target_item = document(@@target_collection,to_string(@target_item))
return {
    name:target_item.name,
    company_name:target_item.company_name,
    phone: target_item.phone ? : '000',
    description: target_item.description[@targetLanguage],
    images: target_item.images,
    properties: (for itemProp in target_item.properties
                    for prop in @@target_properties_collection
                    filter itemProp==prop._key return prop.name[@targetLanguage])
}`,
                bindVars:
                    {
                        "@target_collection": item_category,
                        "target_item": item_key,
                        "@target_properties_collection": properties_collection,
                        "targetLanguage":targetLanguage
                    }
            }
        ).toArray()
        return result;
    }
}

//1.2
function Returnable_Update_Item_Name(req,res)
{
    let {0:item_category,1:item_key,2:new_item_name,...other} = req.body

    item_category = item_category?item_category.toLowerCase():null
    const doesTargetDocumentExist = DBSFunctions.DoesDocumentExistsInTargetCollection(item_category,item_key)
    if(doesTargetDocumentExist===true)
    {
        new_item_name=new_item_name==null||new_item_name===""?
            "":new_item_name

        if(new_item_name!=="" && new_item_name!=null)
        {
            const {0: result} = db._query(
                {
                    query: `update {_key:to_string(@item_key)} with {name:@new_item_name}
in @@target_collection return NEW.name`,
                    bindVars:
                        {
                            "item_key": item_key,
                            "new_item_name": new_item_name,
                            "@target_collection": item_category
                        }
                }
            ).toArray()
            return result
        }
        else
        {
            Logs.WriteLogMessage(`Phone number cant be '' or null`)
            return `Phone number cant be '' or null`
        }
    }
}

// 1.1
function Returnable_Get_Item_Name(req,res)
{
    let {0:item_category,1:item_key,...other} = req.body

    item_category = item_category?item_category.toLowerCase():null
    const doesTargetDocumentExist = DBSFunctions.DoesDocumentExistsInTargetCollection(item_category,item_key)
    if(doesTargetDocumentExist===true)
    {
        const{0:result} = db._query(
            {
                query:`return document(@@target_collection,to_string(@item_key)).name`,
                bindVars:
                    {
                        "item_key": item_key,
                        "@target_collection": item_category
                    }
            }
        ).toArray()

        return result
    }
}

function Get_Item_Info(req,res)
{
    let info = Returnable_Get_Item_Info(req);
    res.send(info);
}
function Update_Item_Name(req,res)
{
    let someVar = Returnable_Update_Item_Name(req,res);
    //res.send(someVar)
}
function Get_Item_Name(req,res)
{
    let someVar = Returnable_Get_Item_Name(req,res);
    res.send(someVar)
}

module.exports.Get_Item_Name = Get_Item_Name;
module.exports.Update_Item_Name = Update_Item_Name;
module.exports.Get_Item_Info = Get_Item_Info;