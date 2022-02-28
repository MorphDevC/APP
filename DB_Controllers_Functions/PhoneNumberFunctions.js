'use strict';
const db=require('@arangodb').db;
const DBSFunctions = require('./DB_SupportFunctions');
const SFn = require("../JS_Support_Files/SupportFiles/SupportFunctions.js");
const Logs = require("../JS_Support_Files/Logs/LogsManager.js");

// // // 11.2
function returnable_insert_update_phone_item(req,res)
{
    let {0:item_category,1:new_phone_item,2:item_key,...other} = req.body

    item_category = item_category?item_category.toLowerCase():null
    const doesTargetDocumentExist = DBSFunctions.DoesDocumentExistsInTargetCollection(item_category,item_key)
    if(doesTargetDocumentExist===true)
    {
        new_phone_item=new_phone_item==null||new_phone_item===""?
            "":
            SFn.ValidatePhone(new_phone_item)?new_phone_item:"Incorrect phone number format"

        if(new_phone_item!=="" && new_phone_item!=null)
        {
            const {0: result} = db._query(
                {
                    query: `update {_key:to_string(@item_key)} with {phone:@new_phone_number}
in @@target_collection return {phone:NEW.phone, _key:NEW._key}`,
                    bindVars:
                        {
                            "item_key": item_key,
                            "new_phone_number": new_phone_item,
                            "@target_collection": item_category
                        }
                }
            ).toArray()
            return result
        }
        else
        {
            Logs.WriteLogMessage(`Phone number cant be ''`)
        }
    }
}

// // // 11.1
function returnable_get_phone_item(req,res)
{
    let {0:item_category,1:item_key,...other} = req.body

    item_category = item_category?item_category.toLowerCase():null
    const doesTargetDocumentExist = DBSFunctions.DoesDocumentExistsInTargetCollection(item_category,item_key)
    if(doesTargetDocumentExist===true)
    {
        const{0:result} = db._query(
            {
                query:`return document(@@target_collection,to_string(@item_key)).phone`,
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

function insert_update_phone_item(req,res)
{
    let someVar = returnable_insert_update_phone_item(req,res);
    res.send(someVar)
}
function get_phone_item(req,res)
{
    let someVar = returnable_get_phone_item(req,res);
    res.send(someVar)
}

module.exports.insert_update_phone_item=insert_update_phone_item;
module.exports.get_phone_item=get_phone_item;