'use strict';
const db=require('@arangodb').db;
const DBSFunctions = require('./DB_SupportFunctions');
const SFn = require("../JS_Support_Files/SupportFiles/SupportFunctions.js");
const Errors = require("../JS_Support_Files/Logs/DB_Errors.js");
const Logs = require("../JS_Support_Files/Logs/LogsManager.js");


//3.3
function returnable_insert_item_in_new_prop(req,res)
{
    let {0:item_category,1:item_key,2:added_properties,3:removable_properties,...other} = req.body
    item_category = item_category?item_category.toLowerCase():null
    added_properties = SFn.Array_To_Lower_Case(added_properties)
    removable_properties=SFn.Array_To_Lower_Case(removable_properties)


    const properties_collection = SFn.ReplaceWord(item_category,'category','properties')

    const doesPropertiesCollectionExists = DBSFunctions.DoesCollectionExists(properties_collection)
    const doesItemAndCategoryExist = DBSFunctions.DoesDocumentExistsInTargetCollection(item_category,item_key)

    if(doesItemAndCategoryExist===true && doesPropertiesCollectionExists ===true)
    {
        const item_id = item_category+'/'+item_key
        let k =db._query(
            {
                query:`for property in @@properties_collection
                        filter property._key in @remove_in_properties
                        update property
                        with {IDs:remove_value(property.IDs,@item_id)}
                        in @@properties_collection`,
                bindVars:
                    {
                        "@properties_collection": properties_collection,
                        "remove_in_properties": removable_properties,
                        "item_id": item_id
                    }
            }
        ) // remove id from every property
        // TODO: maybe this one isfunction for 2.3.2 when item is switching the category
        k = db._query(
            {
                query:`for property in @@properties_collection
                        filter property._key in @add_to_properties
                        update property
                        with {IDs:append(property.IDs,@item_id,true)}
                        in @@properties_collection`,
                bindVars:
                    {
                        "@properties_collection": properties_collection,
                        "add_to_properties": added_properties,
                        "item_id": item_id
                    }
            }
        ) // insert id in every property

        //update item's properties
        k = db._query(
            {
                query:`let doc = document(@@ref_target_collection,to_string(@ref_item_key))

    let tempIDs = remove_values(doc.properties,@removable_property_keys)
    let insertable_new_IDs = append(tempIDs,@insertable_property_keys,true)
    update doc with {properties:insertable_new_IDs} in @@ref_target_collection`,
                bindVars:
                    {
                        "@ref_target_collection": item_category,
                        "ref_item_key": item_key,
                        "removable_property_keys": removable_properties,
                        "insertable_property_keys": added_properties
                    }
            }
        )

        return true;
    }
}

// // 3.2
function returnable_insert_new_property_in_properties_collection(req,res)
{
    let {0:target_category,1:insertable_property_names,...other}= req
    target_category=target_category.toLowerCase()

    const property_collection = SFn.ReplaceWord(target_category,'category','properties')
    const {0:template_to_parse} = db._query(SFn.GetTemplateDocumentOfCollection("Properties") ).toArray();

    if (Errors.ObjectChecks.ObjectHasProperty(insertable_property_names)) // Defence if key is null
    {
        const property_key = SFn.ReplaceSpacesToUnderscore(insertable_property_names.en.toLowerCase())
        const doesPropertyExist=  DBSFunctions.DoesDocumentExistsInTargetCollection(property_collection,property_key,true)


        if(doesPropertyExist===false) // defence if document is exist
        {
            let document_template =SFn.ParseDocument(template_to_parse,insertable_property_names.en,true)

            let k =db._query(
                {
                    query:`for i in 1..2
upsert {_key:to_string(@property_key)}
insert ${document_template}
update {name:merge(OLD.name,@property_names)} in @@target_properties_collection return NEW`,
                    bindVars:
                        {
                            "property_key": property_key,
                            "property_names": insertable_property_names,
                            "@target_properties_collection": property_collection
                        }
                }
            )

            return k;
        }
        else
        {
            Logs.WriteLogMessage("Document already exist",true)
        }
    }
}

////3.1
function returnable_get_all_properties(req,res)
{
    //3.1
    // #reference to FUNC 2.2
    let {0:category,1:target_language,...other} = req.body
    category= category.toLowerCase()
    target_language = SFn.GetTargetLanguageDefence(target_language)

    const property_collection = SFn.ReplaceWord(category,'category','properties')

    const props = db._query(
        {
            query:`for property in @@reference_property_collection
RETURN property.name[@target_language]=="" || property.name[@target_language]==null?
[concat("Missing property name '",property.name['en'], "' on language: '",@target_language,"'"),property._key]:
[property.name[@target_language],property._key]`,
            bindVars:
                {
                    "@reference_property_collection": property_collection,
                    "target_language": target_language
                }
        }
    ).toArray()

    return props
}

function insert_item_in_new_prop(req,res)
{
    let someVar = returnable_insert_item_in_new_prop(req,res);
    //res.send(someVar)
}
function insert_new_property_in_properties_collection(req,res)
{
    let someVar = returnable_insert_new_property_in_properties_collection(req,res);
    //res.send(someVar)
}
function get_all_properties(req,res)
{
    let someVar = returnable_get_all_properties(req,res);
    res.send(someVar)
}

module.exports.insert_item_in_new_prop = insert_item_in_new_prop;
module.exports.insert_new_property_in_properties_collection = insert_new_property_in_properties_collection;
module.exports.get_all_properties=get_all_properties;