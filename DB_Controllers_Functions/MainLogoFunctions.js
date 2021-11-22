'use strict';
const db=require('@arangodb').db;
const DBSFunctions = require('./DB_SupportFunctions');
const default_image = "S:\\4_Images\\DefaultImage.jpg"
// // 5.3
function Returnable_Remove_Main_Logo_Item(req,res)
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
function Returnable_Insert_Update_Main_Logo_Item(req,res)
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
function Returnable_Get_Main_Logo_Item(req,res)
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

function Remove_Main_Logo_Item(req,res)
{
    let someVar = Returnable_Remove_Main_Logo_Item(req,res);
    //res.send(someVar)
}
function Insert_Update_Main_Logo_Item(req,res)
{
    let someVar = Returnable_Insert_Update_Main_Logo_Item(req,res);
    //res.send(someVar)
}
function Get_Main_Logo_Item(req,res)
{
    let someVar = Returnable_Get_Main_Logo_Item(req,res);
    //res.send(someVar)
}

module.exports.Remove_Main_Logo_Item=Remove_Main_Logo_Item;
module.exports.Insert_Update_Main_Logo_Item=Insert_Update_Main_Logo_Item;
module.exports.Get_Main_Logo_Item=Get_Main_Logo_Item;