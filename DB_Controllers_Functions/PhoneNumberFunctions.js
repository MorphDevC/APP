'use strict';
const db=require('@arangodb').db;
const DBSFunctions = require('./DB_SupportFunctions');
const SFn = require("./../SupportFunctions.js");
const Logs = require("./../DB_Support_Files/LogsManager.js");

// // // 11.2
function Insert_Update_Phone_Item(req,res)
{
    let {0:item_category,1:item_key,2:new_phone_item,...other} = req.body

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
in @@target_collection return NEW.phone`,
                    bindVars:
                        {
                            "item_key": item_key,
                            "new_phone_number": new_phone_item,
                            "@target_collection": item_category
                        }
                }
            ).toArray()
            res.send(result)
        }
        else
        {
            Logs.WriteLogMessage(`Phone number cant be ''`)
        }
    }
}

// // // 11.1
function Get_Phone_Item(req,res)
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
        res.send(result)
    }
}


module.exports.Insert_Update_Phone_Item=Insert_Update_Phone_Item;
module.exports.Get_Phone_Item=Get_Phone_Item;