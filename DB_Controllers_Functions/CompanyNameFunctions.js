'use strict';
const db=require('@arangodb').db;
const DBSFunctions = require('./DB_SupportFunctions');

// // // 8.2
function returnable_insert_update_company_name_item(req,res)
{
    let {0:item_category,1:item_new_company_name,2:item_key,...other} = req.body

    item_category = item_category?item_category.toLowerCase():null
    const doesTargetDocumentExist = DBSFunctions.DoesDocumentExistsInTargetCollection(item_category,item_key)
    if(doesTargetDocumentExist===true && item_new_company_name!==""&& item_new_company_name!=null)
    {
        const{0:result} = db._query(
            {
                query:`update {_key:to_string(@item_key)} with {company_name:@new_company_name}
in @@target_collection return {company_name:NEW.company_name,_key:NEW._key}`,
                bindVars:
                    {
                        "item_key": item_key,
                        "new_company_name": item_new_company_name,
                        "@target_collection": item_category
                    }
            }
        ).toArray()
        return result
    }
}

function insert_update_company_name_item(req,res)
{
    let updatedCompanyName = returnable_insert_update_company_name_item(req,res)
    res.send(updatedCompanyName)
}
// // // 8.1
function returnable_get_company_name_item(req,res)
{
    let {0:item_category,1:item_key,...other} = req.body

    item_category = item_category?item_category.toLowerCase():null
    const doesTargetDocumentExist = DBSFunctions.DoesDocumentExistsInTargetCollection(item_category,item_key)
    if(doesTargetDocumentExist===true)
    {
        const{0:result} = db._query(
            {
                query:`return document(@@target_collection,to_string(@item_key)).company_name`,
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

function get_company_name_item(req,res)
{
    let someVar = returnable_get_company_name_item(req,res)
    res.send(someVar)
}


module.exports.insert_update_company_name_item=insert_update_company_name_item;
module.exports.get_company_name_item=get_company_name_item;