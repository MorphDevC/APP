'use strict';
const db=require('@arangodb').db;
const DBSFunctions = require('./DB_SupportFunctions');

// // // 6.3
function Returnable_Remove_Images_In_Item(req,res)
{
    let {0:item_category,1:item_key,2:item_removable_images,...other} = req.body

    item_category = item_category?item_category.toLowerCase():null
    const doesTargetDocumentExist = DBSFunctions.DoesDocumentExistsInTargetCollection(item_category,item_key)
    if(doesTargetDocumentExist===true && item_removable_images.length>0)
    {

        const {0:result} =  db._query(
            {
                query:`let target_document = document(@@target_collection,to_string(@target_key))

update target_document
with {images:remove_values(target_document.images,@removable_images)}
in @@target_collection return NEW`,
                bindVars:
                    {
                        "@target_collection": item_category,
                        "target_key": item_key,
                        "removable_images": item_removable_images
                    }
            }
        ).toArray()
        return result
    }
}

// // // 6.2
function Returnable_Insert_Images_In_Item(req,res)
{
    let {0:item_category,1:item_key,2:item_insertable_images,...other} = req.body

    item_category = item_category?item_category.toLowerCase():null
    const doesTargetDocumentExist = DBSFunctions.DoesDocumentExistsInTargetCollection(item_category,item_key)
    if(doesTargetDocumentExist===true)
    {
        const {0:result} =  db._query(
            {
                query:`let doc = document(@@ref_target_collection,to_string(@ref_item_key))

update doc with {images:append(doc.images,@insertable_images,true)}
in @@ref_target_collection return NEW`,
                bindVars:
                    {
                        "@ref_target_collection": item_category,
                        "ref_item_key": item_key,
                        "insertable_images": item_insertable_images
                    }
            }
        ).toArray()
        return result
    }
}

// // 6.1
function Returnable_Get_Images_Item(req,res)
{

    let {0:item_category,1:item_key,...other} = req.body

    item_category = item_category?item_category.toLowerCase():null
    const doesTargetDocumentExist = DBSFunctions.DoesDocumentExistsInTargetCollection(item_category,item_key)
    if(doesTargetDocumentExist===true)
    {
        const {0:images_array} = db._query(
            {
                query:`return document(@@ref_target_collection,to_string(@ref_item_key)).images`,
                bindVars:
                    {
                        "@ref_target_collection": item_category,
                        "ref_item_key": item_key
                    }
            }
        ).toArray()
        //images_array.forEach(e=>console.log(e))
        return images_array
    }
}

function Remove_Images_In_Item(req,res)
{
    let someVar = Returnable_Remove_Images_In_Item(req,res);
    //res.send(someVar)
}
function Insert_Images_In_Item(req,res)
{
    let someVar = Returnable_Insert_Images_In_Item(req,res);
    //res.send(someVar)
}
function Get_Images_Item(req,res)
{
    let someVar = Returnable_Get_Images_Item(req,res);
    res.send(someVar)
}

module.exports.Remove_Images_In_Item=Remove_Images_In_Item;
module.exports.Insert_Images_In_Item=Insert_Images_In_Item;
module.exports.Get_Images_Item=Get_Images_Item;