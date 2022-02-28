'use strict';
const db=require('@arangodb').db;
const DBSFunctions = require('./DB_SupportFunctions');
const SFn = require("../JS_Support_Files/SupportFiles/SupportFunctions.js");
const Errors = require("../JS_Support_Files/Logs/DB_Errors.js");


function returnable_get_item_description_in_every_language(req,res)
{
    let {0:item_category,1:item_key,...other} = req.body

    item_category = item_category?item_category.toLowerCase():null
    const doesTargetDocumentExist = DBSFunctions.DoesDocumentExistsInTargetCollection(item_category,item_key)
    if(doesTargetDocumentExist===true)
    {
        const{0:result} = db._query(
            {
                query:`let target_item = document(@@target_collection,to_string(@target_item))
return target_item.description`,
                bindVars:
                    {
                        "target_item": item_key,
                        "@target_collection": item_category
                    }
            }
        ).toArray()

        return result
    }
}

function get_item_description_in_every_language(req,res)
{
    let description = returnable_get_item_description_in_every_language(req,res);
    res.send(description);
}
// 4.3
function returnable_update_item_description_in_one_language(req,res)
{
    let {0:item_category,1:target_language,2:new_description,3:item_key,...other} = req.body
    item_category = item_category?item_category.toLowerCase():null
    target_language = SFn.GetTargetLanguageDefence(target_language)
    new_description = new_description!=null&&new_description!==""?new_description:`Description on '${target_language}' language is missing`

    const k = db._query(
        {
            query:`    let doc = document(@@target_category,to_string(@item_key))
    update doc with {description:{[@language]:to_string(@new_description)}}
in @@target_category return NEW`,
            bindVars:
                {
                    "@target_category": item_category,
                    "item_key": item_key,
                    "language": target_language,
                    "new_description": new_description
                }
        }
    )
    return
}


// 4.2
function returnable_update_item_description_in_every_language(req,res)
{
    let {0:item_category,1:description,2:item_key,...other} = req.body
    item_category = item_category?item_category.toLowerCase():null

    if(Errors.ObjectChecks.ObjectHasProperty(description)===true)
    {
        const doesDocumentExist = DBSFunctions.DoesDocumentExistsInTargetCollection(item_category, item_key)
        if (doesDocumentExist === true)
        {
            const k = db._query(
                {
                    query: `let doc = document(@@target_category,to_string(@item_key))
update doc with {description:(merge(doc.description,@tempArr))}
in @@target_category`,
                    bindVars:
                        {
                            "@target_category": item_category,
                            "item_key": item_key,
                            "tempArr": description
                        }
                }
            )
            req.body = [item_category,item_key];
            return returnable_get_item_description_in_every_language(req,null)
        }
    }
}

// 4.1
function returnable_get_item_description(req,res)
{
    let {0:item_category,1:target_language,2:item_key,...other} = req.body
    item_category = item_category?item_category.toLowerCase():null
    target_language = SFn.GetTargetLanguageDefence(target_language)

    const doesTargetDocumentExist=DBSFunctions.DoesDocumentExistsInTargetCollection(item_category,item_key)
    if(doesTargetDocumentExist===true)
    {
        const {0:description} = db._query(
            {
                query:`let doc = document(@@target_category,to_string(@item_key))
RETURN doc.description[@language]==""?
concat("Missing category name '",doc.description['en'], "' on language: '",@language,"'"):
doc.description[@language]`,
                bindVars:
                    {
                        "@target_category": item_category,
                        "item_key": item_key,
                        "language": target_language
                    }
            }
        ).toArray()
        return description
    }
}


function update_item_description_in_one_language(req,res)
{
    let someVar = returnable_update_item_description_in_one_language(req,res);
    // res.send(someVar)
}
function update_item_description_in_every_language(req,res)
{
    let updatedDescription = returnable_update_item_description_in_every_language(req,res);
    res.send(updatedDescription)
}
function get_item_description(req,res)
{
    let someVar = returnable_get_item_description(req,res);
    // res.send(someVar)
}

module.exports.update_item_description_in_one_language = update_item_description_in_one_language;
module.exports.update_item_description_in_every_language=update_item_description_in_every_language;
module.exports.get_item_description=get_item_description;