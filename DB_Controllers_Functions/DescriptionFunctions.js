'use strict';
const db=require('@arangodb').db;
const DBSFunctions = require('./DB_SupportFunctions');
const SFn = require("./../SupportFunctions.js");
const Errors = require("./../DB_Support_Files/DB_Errors.js");

// 4.3
function returnable_update_item_description_in_one_language(req,res)
{
    let {0:item_category,1:item_key,2:target_language,3:new_description,...other} = req.body
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
    return `document ${item_category}/${item_key} description in ${target_language} was updated with text ${new_description}`
}


// 4.2
function returnable_update_item_description_in_every_language(req,res)
{
    let {0:item_category,1:item_key,2:description,...other} = req.body
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
           return "Description updated"
        }
    }
}

// 4.1
function returnable_get_item_description(req,res)
{
    let {0:item_category,1:item_key,2:target_language,...other} = req.body
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
    let someVar = returnable_update_item_description_in_every_language(req,res);
    // res.send(someVar)
}
function get_item_description(req,res)
{
    let someVar = returnable_get_item_description(req,res);
    // res.send(someVar)
}

module.exports.update_item_description_in_one_language = update_item_description_in_one_language;
module.exports.update_item_description_in_every_language=update_item_description_in_every_language;
module.exports.get_item_description=get_item_description;