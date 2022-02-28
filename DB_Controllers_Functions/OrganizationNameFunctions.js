'use strict';
const db=require('@arangodb').db;
const DBSFunctions = require('./DB_SupportFunctions');

// ////10.2
function returnable_insert_update_organization_name_item(req,res)
{
    let {0:item_category,1:new_organization_name_item,2:item_key,...other} = req.body

    item_category = item_category?item_category.toLowerCase():null
    const doesTargetDocumentExist = DBSFunctions.DoesDocumentExistsInTargetCollection(item_category,item_key)
    if(doesTargetDocumentExist===true && new_organization_name_item!=null && new_organization_name_item!=="")
    {
        new_organization_name_item=new_organization_name_item==null||new_organization_name_item===""?
            "organization name is missing":new_organization_name_item

        const{0:result} = db._query(
            {
                query:`update {_key:to_string(@item_key)} with {organization_name:@new_org_name}
in @@target_collection return {organization_name:NEW.organization_name,_key:NEW._key}`,
                bindVars:
                    {
                        "item_key": item_key,
                        "new_org_name": new_organization_name_item,
                        "@target_collection": item_category
                    }
            }
        ).toArray()
        return result
    }
}


// // // // 10.1
function returnable_get_organization_name_item(req,res)
{
    let {0:item_category,1:item_key,...other} = req.body

    item_category = item_category?item_category.toLowerCase():null
    const doesTargetDocumentExist = DBSFunctions.DoesDocumentExistsInTargetCollection(item_category,item_key)
    if(doesTargetDocumentExist===true)
    {
        const{0:result} = db._query(
            {
                query:`return document(@@target_collection,to_string(@item_key)).organization_name`,
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

function insert_update_organization_name_item(req,res)
{
    let updatedOrganizationName = returnable_insert_update_organization_name_item(req,res);
    res.send(updatedOrganizationName)
}
function get_organization_name_item(req,res)
{
    let someVar = returnable_get_organization_name_item(req,res);
    //res.send(someVar)
}

module.exports.insert_update_organization_name_item=insert_update_organization_name_item;
module.exports.get_organization_name_item=get_organization_name_item;