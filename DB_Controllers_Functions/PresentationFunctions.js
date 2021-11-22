'use strict';
const db=require('@arangodb').db;
const DBSFunctions = require('./DB_SupportFunctions');

// // // 7.3
function Returnable_Remove_Presentation_In_Item(req,res)
{
    let {0:item_category,1:item_key,2:item_removable_presentations,...other} = req.body

    item_category = item_category?item_category.toLowerCase():null
    const doesTargetDocumentExist = DBSFunctions.DoesDocumentExistsInTargetCollection(item_category,item_key)
    if(doesTargetDocumentExist===true && item_removable_presentations>0)
    {
        console.log( item_removable_presentations[0])

        const {0:result} =  db._query(
            {
                query:`let target_document = document(@@target_collection,to_string(@target_key))

update target_document
with {presentations:remove_values(target_document.presentations,@removable_presentations)}
in @@target_collection return NEW`,
                bindVars:
                    {
                        "@target_collection": item_category,
                        "target_key": item_key,
                        "removable_presentations": item_removable_presentations
                    }
            }
        ).toArray()
        return result
    }
}

// // // 7.2
function Returnable_Insert_New_Presentation_In_Item(req,res)
{
    let {0:item_category,1:item_key,2:item_insertable_presentations,...other} = req.body

    item_category = item_category?item_category.toLowerCase():null
    const doesTargetDocumentExist = DBSFunctions.DoesDocumentExistsInTargetCollection(item_category,item_key)
    if(doesTargetDocumentExist===true && item_insertable_presentations.length>0)
    {
        const {0:result} =  db._query(
            {
                query:`let doc = document(@@ref_target_collection,to_string(@ref_item_key))

update doc with {presentations:append(doc.presentations,@insertable_images,true)}
in @@ref_target_collection return NEW`,
                bindVars:
                    {
                        "@ref_target_collection": item_category,
                        "ref_item_key": item_key,
                        "insertable_images": item_insertable_presentations
                    }
            }
        ).toArray()
        return result
    }
}


// // // 7.1
function Returnable_Get_Presentations_Item(req,res)
{
    let {0:item_category,1:item_key,...other} = req.body

    item_category = item_category?item_category.toLowerCase():null
    const doesTargetDocumentExist = DBSFunctions.DoesDocumentExistsInTargetCollection(item_category,item_key)
    if(doesTargetDocumentExist===true)
    {
        const {0:presentations_array} = db._query(
            {
                query:`return document(@@ref_target_collection,to_string(@ref_item_key)).presentations`,
                bindVars:
                    {
                        "@ref_target_collection": item_category,
                        "ref_item_key": item_key
                    }
            }
        ).toArray()
        return presentations_array;
    }
}

function Remove_Presentation_In_Item(req,res)
{
    let someVar = Returnable_Remove_Presentation_In_Item(req,res);
    //res.send(someVar);
}
function Insert_New_Presentation_In_Item(req,res)
{
    let someVar = Returnable_Insert_New_Presentation_In_Item(req,res);
    //res.send(someVar);
}
function Get_Presentations_Item(req,res)
{
    let someVar = Returnable_Get_Presentations_Item(req,res);
    res.send(someVar);
}

module.exports.Remove_Presentation_In_Item=Remove_Presentation_In_Item;
module.exports.Insert_New_Presentation_In_Item=Insert_New_Presentation_In_Item;
module.exports.Get_Presentations_Item=Get_Presentations_Item;