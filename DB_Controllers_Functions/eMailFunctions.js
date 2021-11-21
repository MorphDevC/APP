'use strict';
const db=require('@arangodb').db;
const DBSFunctions = require('./DB_SupportFunctions');
const SFn = require("./../SupportFunctions.js");

// // // //9.2
function Insert_Update_eMail_Item(req,res)
{
    let {0:item_category,1:item_key,2:new_eMail_item,...other} = req.body

    item_category = item_category?item_category.toLowerCase():null
    const doesTargetDocumentExist = DBSFunctions.DoesDocumentExistsInTargetCollection(item_category,item_key)
    if(doesTargetDocumentExist===true&&new_eMail_item!=null&&new_eMail_item!=="")
    {
        new_eMail_item=new_eMail_item==null||new_eMail_item===""?
            "eMail is missing":
            new_eMail_item=SFn.ValidateEmail(new_eMail_item)?new_eMail_item:"eMail is not validated"

        const{0:result} = db._query(
            {
                query:`update {_key:to_string(@item_key)} with {email:@new_email}
in @@target_collection return NEW.email`,
                bindVars:
                    {
                        "item_key": item_key,
                        "new_email": new_eMail_item,
                        "@target_collection": item_category
                    }
            }
        ).toArray()
        console.log(result)
    }
}


// // // 9.1
function Get_eMail_Item(req,res)
{
    let {0:item_category,1:item_key,...other} = req.body

    item_category = item_category?item_category.toLowerCase():null
    const doesTargetDocumentExist = DBSFunctions.DoesDocumentExistsInTargetCollection(item_category,item_key)
    if(doesTargetDocumentExist===true)
    {
        const{0:result} = db._query(
            {
                query:`return document(@@target_collection,to_string(@item_key)).email`,
                bindVars:
                    {
                        "item_key": item_key,
                        "@target_collection": item_category
                    }
            }
        ).toArray()
        console.log(result)
    }
}

module.exports.Insert_Update_eMail_Item=Insert_Update_eMail_Item;
module.exports.Get_eMail_Item=Get_eMail_Item;