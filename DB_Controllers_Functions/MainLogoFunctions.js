'use strict';
const db=require('@arangodb').db;
const DBSFunctions = require('./DB_SupportFunctions');
const default_image = "S:\\4_Images\\DefaultImage.jpg"
// // 5.3
function returnable_remove_main_logo_item(req,res)
{
    let {0:item_category,1:item_key,...other} = req.body

    item_category = item_category?item_category.toLowerCase():null
    const doesTargetDocumentExist = DBSFunctions.DoesDocumentExistsInTargetCollection(item_category,item_key)
    if(doesTargetDocumentExist===true)
    {
        const {0:new_image} = db._query(
            {
                query:`update to_string(@target_key) with {main_logo:@ref_path_main_logo} in @@target_category
return NEW`,
                bindVars:
                    {
                        "target_key": item_key,
                        "ref_path_main_logo":default_image,
                        "@target_category": item_category
                    }
            }
        ).toArray()
        return new_image
    }
}

// 5.2
function returnable_insert_update_main_logo_item(req,res)
{


    let {0:item_category,1:item_key,2:item_image_path,...other} = req.body
    item_image_path = item_image_path ==null||item_image_path===""?default_image:item_image_path

    item_category = item_category?item_category.toLowerCase():null
    const doesTargetDocumentExist = DBSFunctions.DoesDocumentExistsInTargetCollection(item_category,item_key)
    if(doesTargetDocumentExist===true)
    {
        const {0:new_image} = db._query(
            {
                query:`update to_string(@target_key) with {main_logo:@ref_path_main_logo} in @@target_category
return NEW`,
                bindVars:
                    {
                        "target_key": item_key,
                        "ref_path_main_logo":item_image_path,
                        "@target_category": item_category
                    }
            }
        ).toArray()
        return new_image
    }
}

// 5.1
function returnable_get_main_logo_item(req,res)
{
    let {0:item_category,1:item_key,...other} = req.body //aaaab_category_push_notifications

    item_category = item_category?item_category.toLowerCase():null
    const doesTargetDocumentExist = DBSFunctions.DoesDocumentExistsInTargetCollection(item_category,item_key)
    if(doesTargetDocumentExist===true)
    {
        const {0:pathMainLogo} = db._query(
            {
                query:`let main_logo = document(@@target_collection, to_string(@target_key)).main_logo
return main_logo==""||main_logo==null?"Main logo is missing":main_logo`,
                bindVars:
                    {
                        "@target_collection": item_category,
                        "target_key": item_key
                    }
            }
        ).toArray()
        return pathMainLogo
    }
}

function remove_main_logo_item(req,res)
{
    let someVar = returnable_remove_main_logo_item(req,res);
    //res.send(someVar)
}
function insert_update_main_logo_item(req,res)
{
    let someVar = returnable_insert_update_main_logo_item(req,res);
    //res.send(someVar)
}
function get_main_logo_item(req,res)
{
    let someVar = returnable_get_main_logo_item(req,res);
    //res.send(someVar)
}

module.exports.remove_main_logo_item=remove_main_logo_item;
module.exports.insert_update_main_logo_item=insert_update_main_logo_item; // warning on renaming to lower case
module.exports.get_main_logo_item=get_main_logo_item;