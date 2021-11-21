'use strict';
const db=require('@arangodb').db;
const DBSFunctions = require('./DB_SupportFunctions');

// // // 8.2
function Insert_Update_Company_Name_Item(req,res)
{
    let {0:item_category,1:item_key,2:item_new_company_name,...other} = req.body

    item_category = item_category?item_category.toLowerCase():null
    const doesTargetDocumentExist = DBSFunctions.DoesDocumentExistsInTargetCollection(item_category,item_key)
    if(doesTargetDocumentExist===true && item_new_company_name!==""&& item_new_company_name!=null)
    {
        const{0:result} = db._query(
            {
                query:`update {_key:to_string(@item_key)} with {company_name:@new_company_name}
in @@target_collection return NEW.company_name`,
                bindVars:
                    {
                        "item_key": item_key,
                        "new_company_name": item_new_company_name,
                        "@target_collection": item_category
                    }
            }
        ).toArray()
        console.log(result)
    }
}

// // // 8.1
function Get_Company_Name_Item(req,res)
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
        console.log(result)
    }
}

module.exports.Insert_Update_Company_Name_Item=Insert_Update_Company_Name_Item;
module.exports.Get_Company_Name_Item=Get_Company_Name_Item;