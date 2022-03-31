'use strict';
const db=require('@arangodb').db;
const DBSFunctions = require('./DB_SupportFunctions');
const SFn = require("../JS_Support_Files/SupportFiles/SupportFunctions.js");
const Logs = require("../JS_Support_Files/Logs/LogsManager.js");
const Errors = require("../JS_Support_Files/Logs/DB_Errors.js");
const UW=require("../JS_Support_Files/SupportFiles/UniqueWords.js")

function returnable_get_all_categories(req,res)
{
    const {0:target_language,...other} = req.body;
    const {0:result}= db._query(
        {
            query:`RETURN MERGE(FOR vertex IN @@target_group_categories_collection
    LET categories_info =MERGE(    
        FOR v, e, p IN 1..2 OUTBOUND vertex @@target_graph_categories_collection
            COLLECT main_cat = p.vertices[0].name INTO otherInfo
            LET category_name_key = MERGE(
                FOR category_name IN otherInfo[*].v.name[@target_language] 
                LET pos = POSITION(otherInfo[*].v.name[@target_language], category_name, true)
                RETURN {[NTH(otherInfo[*].v._key,pos)]:category_name}
                ) 
            RETURN {[main_cat[@target_language]]:category_name_key}
                )
RETURN categories_info)`,
            bindVars:
                {
                    "@target_group_categories_collection": UW.word.collections.group_categories,
                    "@target_graph_categories_collection": UW.word.collections.group_categories_edge,
                    "target_language": target_language
                }
        }
    ).toArray()
    return result

}

function get_all_categories(req,res)
{
    let categories = returnable_get_all_categories(req,res)
    res.send(categories)
}


//2.9
function returnable_swap_subcategory_assignment_to_main_category(req,res)
{
    const {0:target_key_sub_category,1:target_new_key_main_category,...other} = req.body;

    let check_existing_sub_category = DBSFunctions.DoesDocumentExistsInTargetCollection(UW.word.collections.support_collections_info,target_key_sub_category)
    let check_existing_main_category = DBSFunctions.DoesDocumentExistsInTargetCollection(UW.word.collections.group_categories,target_new_key_main_category)

    if (check_existing_main_category===true && check_existing_sub_category===true)
    {
        const from_key = UW.word.collections.group_categories.concat("/",target_new_key_main_category);
        const to_key = UW.word.collections.support_collections_info.concat("/",target_key_sub_category);

        let is_sub_category_assigned_to_main_category = DBSFunctions.DoesDocumentExistsInTargetEdgeCollection(UW.word.collections.group_categories_edge,to_key,true);
        if(is_sub_category_assigned_to_main_category ===true)
        {

            const {0:res}= db._query(
                {
                    query:`FOR cat IN group_categories_edge
FILTER cat._to ==@target_sub_category
UPDATE cat with {_from:@new_main_category_id} INTO group_categories_edge return NEW`,
                    bindVars:
                        {
                            "target_sub_category": to_key,
                            "new_main_category_id": from_key
                        }
                }
            ).toArray()

            return res;
        }
        else
        {
            return `SUB category ${target_key_sub_category} has been already assigned to MAIN category with key '${target_new_key_main_category}'`;
        }
    }
    else
    {
        return `In target MAIN categories collection ${UW.word.collections.group_categories} doesnt exists document with key ${target_new_key_main_category}\n
        or in target SUB categories collection ${UW.word.collections.group_categories} doesnt exists document with key ${target_key_sub_category} `
    }
}
function swap_subcategory_assignment_to_main_category(req,res)
{
    let status =  returnable_swap_subcategory_assignment_to_main_category(req,res);
    res.send(status);
}


//2.8
function returnable_assign_subcategory_main_category(req,res)
{
    const {0:target_key_sub_category,1:target_key_main_category,...other} = req.body;

    let check_existing_sub_category = DBSFunctions.DoesDocumentExistsInTargetCollection(UW.word.collections.support_collections_info,target_key_sub_category)
    let check_existing_main_category = DBSFunctions.DoesDocumentExistsInTargetCollection(UW.word.collections.group_categories,target_key_main_category)

    if (check_existing_main_category===true && check_existing_sub_category===true)
    {
        const from_key = UW.word.collections.group_categories.concat("/",target_key_main_category);
        const to_key = UW.word.collections.support_collections_info.concat("/",target_key_sub_category);

        let is_sub_category_assigned_to_main_category = DBSFunctions.DoesDocumentExistsInTargetEdgeCollection(UW.word.collections.group_categories_edge,to_key,true);
        console.log(is_sub_category_assigned_to_main_category);
        if(is_sub_category_assigned_to_main_category ===false)
        {

            const {0:res}= db._query(
                {
                    query:`INSERT {_from: @target_main_category_id, _to:@target_sub_category_id} INTO group_categories_edge return NEW`,
                    bindVars:
                        {
                            "target_main_category_id": from_key,
                            "target_sub_category_id": to_key
                        }
                }
            ).toArray()

            return res;
        }
        else
        {
            return `SUB category ${target_key_sub_category} has been already assigned to MAIN category`;
        }
    }
    else
    {
        return `In target main categories collection ${UW.word.collections.group_categories} doesnt exists document with key ${target_key_main_category}\n
        or in target sub categories collection ${UW.word.collections.group_categories} doesnt exists document with key ${target_key_sub_category} `
    }
}

function assign_subcategory_to_main_category(req,res)
{
    let status = returnable_assign_subcategory_main_category(req,res);
    res.send(status);
}

//2.7
function returnable_get_all_companies_in_category(req,res)
{
    let {0:target_category,...other} = req.body

    target_category = target_category?target_category.toLowerCase():null
    return db._query(
        {
            query: `FOR item IN @@targetCollection RETURN item.company_name`,
            bindVars:
                {
                    "@targetCollection": target_category
                }
        }
    ).toArray()
}
function get_all_companies_in_category(req,res)
{
    let companies = returnable_get_all_companies_in_category(req,res);
    res.send(companies);
}

//2.6
function returnable_create_main_category(req,res)
{
        const {0:main_category_names,...other} = req.body;

        let {0:last_key} = db._query(
            `let keys = (for i in group_categories
    return i._key)
    return last(keys)`
        ).toArray()
        const next_key = SFn.CreateNewPrefix(last_key)
        const {0:template_to_parse} = db._query(SFn.GetTemplateDocumentOfCollection("group_categories")).toArray();

        let document_template =SFn.ParseDocument(template_to_parse,next_key,true)
        let {0:k} = db._query(
            {
                query:`for i in 1..2
upsert {_key:to_string(@target_key)}
insert ${document_template}
update {name:merge(OLD.name,@main_category_names)} in group_categories return NEW`,
                bindVars:
                    {
                        "target_key": next_key,
                        "main_category_names": main_category_names
                    }
            }
        ).toArray()
}
function create_main_category(req,res)
{
    try {
        let m = returnable_create_main_category(req)
        res.send("Main category has been created")
    }
    catch (e) {
        res.send(e.message)
    }
}

// 2.5
function returnable_get_all_items_in_category(req,res)
{
    let {0:category,...other} = req.body

    category = category?category.toLowerCase():null
    const doesTargetCategoryExist = DBSFunctions.DoesCollectionExists(category)
    if(doesTargetCategoryExist===true)
    {
        const items = db._query(
            {
                query:`FOR item IN @@targetCollection RETURN [item.name, item._key]`,
                bindVars:
                    {
                        "@targetCollection":category
                    }
            }
        ).toArray()
        return items
    }
}
function get_all_items_in_category(req,res)
{
    let items = returnable_get_all_items_in_category(req,res);
    res.send(items);
}

//2.4
function returnable_get_items_amount_of_category(req, res)
{
    //RETURN LENGTH(@@category)
    let {0:category,...other} = req.body

    category = category?category.toLowerCase():null
    const doesTargetCategoryExist = DBSFunctions.DoesCollectionExists(category)
    if(doesTargetCategoryExist===true)
    {
        const {0:amount} = db._query(
            {
                query:`RETURN LENGTH(@@category)`,
                bindVars:
                    {
                        "@category":category
                    }
            }
        ).toArray()
        return amount
    }
}

function get_items_amount_of_category(req,res)
{
    let amountOfCategory = returnable_get_items_amount_of_category(req,res);
    res.send(amountOfCategory);
}

//2.3
function returnable_swap_item_category(req,res)
{
    let {0:new_category,1:old_category,2:item_key,...other} = req.body
    old_category = old_category?old_category.toLowerCase():null
    new_category = new_category?new_category.toLowerCase():null

    let doesSupportDocumentExist=  DBSFunctions.DoesDocumentExistsInTargetCollection(UW.word.collections.support_collections_info,new_category)
    if(doesSupportDocumentExist===true)
    {
        let doesTargetDocumentExist = DBSFunctions.DoesDocumentExistsInTargetCollection(old_category,item_key)
        doesSupportDocumentExist = DBSFunctions.DoesDocumentExistsInTargetCollection(UW.word.collections.support_collections_info,old_category)
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
                const property_collection = SFn.ReplaceWord(old_category,UW.word.word.category,UW.word.word.properties)
                const item_id = old_category+'/'+item_key
                let m = db._query(
                    {
                        query:`remove '${item_key}' in @@ref_old_coll

for property in @@ref_old_properties_collection
filter POSITION(property.IDs,@removable_item_id)
update property with {IDs: remove_value(property.IDs,@removable_item_id)} in @@ref_old_properties_collection`,
                        bindVars: {
                            "@ref_old_coll": old_category,
                            "@ref_old_properties_collection": property_collection,
                            "removable_item_id": item_id
                        }
                    })
                    DBSFunctions.FreeKeys_UpdateOnREMOVE(old_category,item_key)

                    doc = SFn.ClearItemProperties(doc)
                    let insertable_document = SFn.ParseDocument(doc,free_key)
                    DBSFunctions.INSERT_DocumentInCollection(insertable_document,free_key,new_category)

                    return "succeed"
                }
            else
            {
                Logs.WriteLogMessage(`Document with _key '${item_key}' in category '${old_category}' does not exist`)
                return `Document with _key '${item_key}' in category '${old_category}' does not exist`
            }
        }
        else
        {
            Logs.WriteLogMessage(`There is no document in collection:'support_collections_info' with key:'${old_category}'.
                \nOr target document doesnt exist in removable collection :${old_category} `)

            return `There is no document in collection:'support_collections_info' with key:'${old_category}'.
                \nOr target document doesnt exist in removable collection :${old_category} `
        }
    }
    else
    {
        Logs.WriteLogMessage(`There is no document in collection:'${UW.word.collections.support_collections_info}' with key:'${new_category}'`)
        return `There is no document in collection:'${UW.word.collections.support_collections_info}' with key:'${new_category}'`
    }
}
function swap_item_category(req,res)
{
    let someVar = returnable_swap_item_category(req,res)
    res.send(someVar)
}

// 2.2
function returnable_create_new_category(req,res)
{
    const {0:category_names,...other} = req.body;
    if (Errors.ObjectChecks.ObjectHasProperty(category_names)===true) // Defense if there is no english name
    {
        const {0:prefixQueryResult}=db._query(`LET tempCol = collections()[*FILTER LIKE(CURRENT.name,"_____\\\\_category%") RETURN CURRENT.name]
// '_' должно быть столько, сколько букв в префиксе
// выибираем только те коллекции, у которых есть префикс (AAAAZ_...)

LET temp_pref =
(
    RETURN trim(NTH(SPLIT(last(tempCol),"_"),0),'[""]')
) // Получаем последний префикс среди всех коллекций (AAAAZ_, где Z - любая буква)

LET count_cols = tempCol[* FILTER LIKE(CURRENT,concat(temp_pref[0],"_%"))]

//Если коллекций 2, то возвращаем префикс, иначе ошибка
RETURN {"Prefix":temp_pref[0]}`
        ).toArray()
        let currentPrefix = prefixQueryResult[Object.keys(prefixQueryResult)]
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
    }

}
function create_new_category(req,res)
{
    let someVar = returnable_create_new_category(req,res);
    // Send if needable
}

//ViewUpdater("aaaad_category_category_name_on_english_from_js")


//2.1
function returnable_get_all_sub_categories(req,res)
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
function get_all_sub_categories(req,res)
{
    let categories = returnable_get_all_sub_categories(req,res);
    res.send(categories)
}

module.exports.swap_item_category = swap_item_category;
module.exports.create_new_category = create_new_category;
module.exports.get_all_sub_categories = get_all_sub_categories;
module.exports.get_items_amount_of_category = get_items_amount_of_category;
module.exports.get_all_items_in_category=get_all_items_in_category;
module.exports.create_main_category = create_main_category;
module.exports.get_all_companies_in_category=get_all_companies_in_category;
module.exports.assign_subcategory_to_main_category=assign_subcategory_to_main_category;
module.exports.swap_subcategory_assignment_to_main_category=swap_subcategory_assignment_to_main_category;
module.exports.get_all_categories = get_all_categories;
