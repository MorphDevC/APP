'use strict';
const db=require('@arangodb').db;
const DBSFunctions = require('./DB_SupportFunctions');
const SFn = require("./../SupportFunctions.js");
const Errors = require("./../DB_Support_Files/DB_Errors.js");

// 4.3
function Update_Item_Description_In_One_Language(req,res)
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
    console.log(`document ${item_category}/${item_key} description in ${target_language} was updated with text ${new_description}`)
}

// 4.2
function Update_Item_Description_In_Every_Language(req,res)
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
            console.log("Description updated")
        }
    }
}

// 4.1
function Get_Item_Description(req,res)
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
        console.log(description)
    }
}

module.exports.Update_Item_Description_In_One_Language = Update_Item_Description_In_One_Language;
module.exports.Update_Item_Description_In_Every_Language=Update_Item_Description_In_Every_Language;
module.exports.Get_Item_Description=Get_Item_Description;