'use strict';
const db=require('@arangodb').db;
const DBSFunctions = require('./DB_SupportFunctions');
const Logs = require("../JS_Support_Files/Logs/LogsManager.js");
const SFn = require("../JS_Support_Files/SupportFiles/SupportFunctions.js");

//1.8
function returnable_get_shot_items_info_by_properties_and_company_names(req,res)
{
    const{0:target_category,1:target_language,2:target_properties_keys,3:target_company_names,...other} = req.body;

    if(target_company_names.length>0 && target_properties_keys.length>0)
    {
        const target_properties_collection = SFn.ReplaceWord(target_category,'category','properties')
        return db._query(
            {
                query: `for item in categories
search @target_properties all in item.properties AND item.company_name in @target_company_names
OPTIONS { collections: [@target_collection] }
return {
    name:item.name,
    company_name:item.company_name,
    logo: item.main_logo,
    properties: (for itemProp in item.properties
                    for prop in @@target_properties_collection
                    filter itemProp==prop._key
                    return prop.name[@targetLanguage])
}
`,
                bindVars:
                    {
                        "target_properties": target_properties_keys,
                        "target_company_names": target_company_names,
                        "target_collection": target_category,
                        "@target_properties_collection": target_properties_collection,
                        "targetLanguage": target_language
                    }
            }
        ).toArray();
    }
    else if(target_company_names.length ===0 && target_properties_keys.length!==0)
        return returnable_get_items_by_properties(req);
    else if(target_properties_keys.length===0 && target_company_names.length!==0)
        return returnable_get_items_by_company_name(req);
    return "error";

}


//1.7
function returnable_get_items_by_company_name(req,res)
{
    const{0:target_category,1:target_language,2:target_properties_keys,3:target_company_names,...other} = req.body;
    const target_properties_collection = SFn.ReplaceWord(target_category,'category','properties')

    return db._query(
        {
            query: `for item in categories
search item.company_name in @target_company_names
OPTIONS { collections: [@target_collection] }
return {
    name:item.name,
    company_name:item.company_name,
    logo: item.main_logo,
    properties: (for itemProp in item.properties
                    for prop in @@target_properties_collection
                    filter itemProp==prop._key
                    return prop.name[@targetLanguage])
}
`,
            bindVars:
                {
                    "target_collection": target_category,
                    "@target_properties_collection": target_properties_collection,
                    "targetLanguage": target_language
                }
        }
    ).toArray();
}

//1.6
function returnable_get_items_by_properties(req,res)
{
    const{0:target_category,1:target_language,2:target_properties_keys,...other} = req.body;
    const target_properties_collection = SFn.ReplaceWord(target_category,'category','properties')

    return db._query(
        {
            query: `for item in categories
search @target_properties all in item.properties
OPTIONS { collections: [@target_collection] }
return {
    name:item.name,
    company_name:item.company_name,
    logo: item.main_logo,
    properties: (for itemProp in item.properties
                    for prop in @@target_properties_collection
                    filter itemProp==prop._key
                    return prop.name[@targetLanguage])
}
`,
            bindVars:
                {
                    "target_properties": target_properties_keys,
                    "target_collection": target_category,
                    "@target_properties_collection": target_properties_collection,
                    "targetLanguage": target_language
                }
        }
    ).toArray();
}

//1.5
function returnable_get_full_item_info(req,res)
{
    let {0:item_category,1:item_key,...other} = req.body

    item_category = item_category?item_category.toLowerCase():null
    const doesTargetDocumentExist = DBSFunctions.DoesDocumentExistsInTargetCollection(item_category,item_key)
    if(doesTargetDocumentExist===true)
    {
        const{0:result} = db._query(
            {
                query:`let target_item = document(@@target_collection,to_string(@target_item))
return target_item`,
                bindVars:
                    {
                        "target_item": item_key,
                        "@target_collection": item_category
                    }
            }
        ).toArray()

        return result
    }
}

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
function get_full_item_info(req,res)
{
    let info = returnable_get_full_item_info(req,res);
    res.send(info);
}
function get_items_by_properties_and_company_names(req,res)
{
    let items = returnable_get_shot_items_info_by_properties_and_company_names(req,res);
    res.send(items);
}


module.exports.get_item_name = get_item_name;
module.exports.update_item_name = update_item_name;
module.exports.get_item_info = get_item_info;
module.exports.get_short_item_info = get_short_item_info;
module.exports.get_full_item_info = get_full_item_info;
module.exports.get_items_by_properties_and_company_names = get_items_by_properties_and_company_names;
