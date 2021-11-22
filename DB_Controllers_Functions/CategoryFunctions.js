'use strict';
const db=require('@arangodb').db;
const DBSFunctions = require('./DB_SupportFunctions');
const SFn = require("./../SupportFunctions.js");
const Logs = require("./../DB_Support_Files/LogsManager.js");
const Errors = require("./../DB_Support_Files/DB_Errors.js");

//2.3
function Returnable_Assignment_Of_A_Category_To_An_Items(req,res)
{
    //let {0:item_key,1:item_name,2:old_category,3:new_category,...other} = req.body //old version
    let {0:new_category,1:old_category,2:item_key,3:item_name,...other} = req.body
    old_category = old_category?old_category.toLowerCase():null
    new_category = new_category?new_category.toLowerCase():null

    //2.3.1
    let doesSupportDocumentExist=  DBSFunctions.DoesDocumentExistsInTargetCollection('support_collections_info',new_category)
    if(doesSupportDocumentExist===true)
    {
        // 2.3.1
        if(item_key>=1)
        {
            let doesTargetDocumentExist = DBSFunctions.DoesDocumentExistsInTargetCollection(old_category,item_key)
            doesSupportDocumentExist = DBSFunctions.DoesDocumentExistsInTargetCollection('support_collections_info',old_category)
            if (doesSupportDocumentExist===true && doesTargetDocumentExist===true)
            {
                const {0:free_key} = db._query(SFn.GetFreeIndex(new_category)).toArray();
                let {0:doc} = db._query(
                    {
                        query:`let doc= DOCUMENT(@@ref_old_coll,to_string(@ref_doc_key))
    return doc!=null?(return UNSET(doc||{},[]))[0]:
    null`,
                        bindVars:
                            {
                                "@ref_old_coll": old_category,
                                "ref_doc_key": item_key
                            }
                    }
                ).toArray()

                if(doc!=null)
                {
                    const property_collection = SFn.ReplaceWord(old_category,'category','properties')
                    const item_id = old_category+'/'+item_key
                    let m = db._query(
                        {
                            query:`remove '${item_key}' in @@ref_old_coll

for property in @@ref_old_properties_collection
filter POSITION(property.IDs,@removable_item_id)
update property with {IDs: remove_value(property.IDs,@removable_item_id)} in @@ref_old_properties_collection`,
                            bindVars:
                                {
                                    "@ref_old_coll": old_category,
                                    "@ref_old_properties_collection": property_collection,
                                    "removable_item_id": item_id
                                }
                        }
                    )
                    DBSFunctions.FreeKeys_UpdateOnREMOVE(old_category,item_key)

                    doc = SFn.ClearItemProperties(doc)
                    let insertable_document = SFn.ParseDocument(doc,free_key)
                    DBSFunctions.INSERT_DocumentInCollection(insertable_document,free_key,new_category)

                    console.log("succeed")
                }
                else
                {
                    Logs.WriteLogMessage(`Document with _key '${item_key}' in category '${old_category}' does not exist`)
                }
            }
            else
            {
                Logs.WriteLogMessage(`There is no document in collection:'support_collections_info' with key:'${old_category}'.
                \nOr target document doesnt exist in removable collection :${old_category} `)
            }
        }
        // 2.3.2
        else
        {
            const {0:free_key} = db._query(SFn.GetFreeIndex(new_category)).toArray();
            const {0:doc} = db._query(SFn.GetTemplateDocumentOfCollection("Categories") ).toArray();
            let document_template =SFn.ParseDocument(doc,free_key)

            DBSFunctions.INSERT_DocumentInCollection(document_template,free_key,new_category);
            let m = db._query({
                query: `
                        UPDATE "${free_key}" WITH { name: "${item_name}" } IN @@ref_col_new
                        `,
                bindVars:
                    {
                        "@ref_col_new": new_category
                    }
            });

            return "return smth in Assignment_Of_A_Category_To_An_Items"
        }
    }
    else
    {
        Logs.WriteLogMessage(`There is no document in collection:'${new_category}' with key:'${new_category}'`)
    }
}
function Assignment_Of_A_Category_To_An_Items(req,res)
{
    let someVar = Returnable_Assignment_Of_A_Category_To_An_Items(req,res)
    //send if needable
}

// 2.2
function Returnable_Create_New_Category(req,res)
{
    const {0:category_names,...other} = req.body;
    if (Errors.ObjectChecks.ObjectHasProperty(category_names)===true) // Defense if there is no english name
    {
        const {0:prefixQueryResult}=db._query(`LET tempCol = collections()[*FILTER LIKE(CURRENT.name,"_____\\\\_%") RETURN CURRENT.name]
// '_' должно быть столько, сколько букв в префиксе
// выибираем только те коллекции, у которых есть префикс (AAAAZ_...)

LET temp_pref =
(
    RETURN trim(NTH(SPLIT(last(tempCol),"_"),0),'[""]')
) // Получаем последний префикс среди всех коллекций (AAAAZ_, где Z - любая буква)

LET count_cols = tempCol[* FILTER LIKE(CURRENT,concat(temp_pref[0],"_%"))]

//Если коллекций 2, то возвращаем префикс, иначе ошибка
RETURN count(count_cols) == 2 ?
{"Prefix":temp_pref[0]}:
{"Prefix":CONCAT("Missing 1 of collection WITH prefixe: '",temp_pref[0],"'. Please contact with DB admin and check collections")}`
        ).toArray()
        let currentPrefix = prefixQueryResult[Object.keys(prefixQueryResult)]

        if (currentPrefix.length === 5)
        {
            let categoryCollectionName = SFn.ReplaceSpacesToUnderscore(category_names.en.toLowerCase(),true)
            const next_prefix = SFn.CreateNewPrefix(currentPrefix)

            const {0:template_to_parse} = db._query(SFn.GetTemplateDocumentOfCollection("support_collections_info") ).toArray();

            const new_category_collection_name=`${next_prefix}_category_${categoryCollectionName}`
            const new_property_collection_name=`${next_prefix}_properties_${categoryCollectionName}`

            let document_template =SFn.ParseDocument(template_to_parse,new_category_collection_name,true)


            db._createDocumentCollection(new_category_collection_name)
            db._createDocumentCollection(new_property_collection_name)

            const m = db._query(
                {
                    query:`for i in 1..2
upsert {_key:to_string(@property_key)}
insert ${document_template}
update {name:merge(OLD.name,@property_names)} in support_collections_info return NEW`,
                    bindVars:
                        {
                            "property_key": new_category_collection_name,
                            "property_names": category_names
                        }
                }).toArray()
            DBSFunctions.ViewUpdater(new_category_collection_name)

            return true;
        } else {Logs.WriteLogMessage(currentPrefix)}
    }

}
function Create_New_Category(req,res)
{
    let someVar = Returnable_Create_New_Category(req,res);
    // Send if needable
}

//ViewUpdater("aaaad_category_category_name_on_english_from_js")


//2.1
function Returnable_Get_All_Categories(req,res)
{
    // 2.1

    let {0:target_language,...other} = req.body
    target_language = SFn.GetTargetLanguageDefence(target_language)//defence from errors


    const cats = db._query(
        {
            query:`   LET findSchema = "_____\\\\_category%" // '_' должно быть столько, сколько букв в префиксе
LET length = length("______category_")


for c in support_collections_info
FILTER LIKE(c._key,findSchema)
sort c ASC
RETURN c.name[@target_language]==""?
concat("Missing category name '",c.name['en'], "' on language: '",@target_language,"'"):[c.name[@target_language],c._key]`,
            bindVars:
                {
                    "target_language":target_language
                }
        }
    ).toArray()
    return cats

}
function Get_All_Categories(req,res)
{
    let categories = Returnable_Get_All_Categories(req,res);
    res.send(categories)
}

module.exports.Assignment_Of_A_Category_To_An_Items = Assignment_Of_A_Category_To_An_Items;
module.exports.Create_New_Category = Create_New_Category;
module.exports.Get_All_Categories = Get_All_Categories;
