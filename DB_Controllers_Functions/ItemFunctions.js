'use strict';
const db=require('@arangodb').db;
const DBSFunctions = require('./DB_SupportFunctions');
const Logs = require("./../DB_Support_Files/LogsManager.js");
const SFn = require("./../SupportFunctions.js");

//1.4
function returnable_get_short_item_info(req,res)
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
    logo: target_item.main_logo,
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

//1.3
function returnable_get_item_info(req,res)
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
function returnable_update_item_name(req,res)
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
function returnable_get_item_name(req,res)
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

function get_item_info(req,res)
{
    let info = returnable_get_item_info(req);
    res.send(info);
}
function update_item_name(req,res)
{
    let someVar = returnable_update_item_name(req,res);
    //res.send(someVar)
}
function get_item_name(req,res)
{
    let someVar = returnable_get_item_name(req,res);
    res.send(someVar)
}
function get_short_item_info(req,res)
{
    let info = returnable_get_short_item_info(req);
    res.send(info);
}


module.exports.get_item_name = get_item_name;
module.exports.update_item_name = update_item_name;
module.exports.get_item_info = get_item_info;
module.exports.get_short_item_info = get_short_item_info;
