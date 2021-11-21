'use strict';
const db=require('@arangodb').db;
const DBSFunctions = require('./DB_SupportFunctions');

// ////10.2
function Insert_Update_Organization_Name_Item(req,res)
{
    let {0:item_category,1:item_key,2:new_organization_name_item,...other} = req.body

    item_category = item_category?item_category.toLowerCase():null
    const doesTargetDocumentExist = DBSFunctions.DoesDocumentExistsInTargetCollection(item_category,item_key)
    if(doesTargetDocumentExist===true && new_organization_name_item!=null && new_organization_name_item!=="")
    {
        new_organization_name_item=new_organization_name_item==null||new_organization_name_item===""?
            "organization name is missing":new_organization_name_item

        const{0:result} = db._query(
            {
                query:`update {_key:to_string(@item_key)} with {organization_name:@new_org_name}
in @@target_collection return NEW.organization_name`,
                bindVars:
                    {
                        "item_key": item_key,
                        "new_org_name": new_organization_name_item,
                        "@target_collection": item_category
                    }
            }
        ).toArray()
        console.log(result)
    }
}


// // // // 10.1
function Get_Organization_Name_Item(req,res)
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
        console.log(result)
    }
}


module.exports.Insert_Update_Organization_Name_Item=Insert_Update_Organization_Name_Item;
module.exports.Get_Organization_Name_Item=Get_Organization_Name_Item;