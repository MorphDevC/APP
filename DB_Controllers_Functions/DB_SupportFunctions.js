'use strict';
const Logs = require("../JS_Support_Files/Logs/LogsManager.js");
const SFn = require("../JS_Support_Files/SupportFiles/SupportFunctions.js");
const db=require('@arangodb').db;

function FreeKeys_UpdateOnINSERT(TargetCollection,InsertedKey)
{
    let query = `let free_keys_doc = document(support_collections_info,'${TargetCollection}')
update free_keys_doc
with {keys:remove_value(free_keys_doc.keys,'${InsertedKey}')}
into support_collections_info`
    const k = db._query(query)
}
function FreeKeys_UpdateOnREMOVE(PreviousCollection,RemovedKey)
{
    let query = `let free_keys_doc = document(support_collections_info,'${PreviousCollection}')
update free_keys_doc
with {keys:append(free_keys_doc.keys,['${RemovedKey}'],true)}
into support_collections_info`
    const k = db._query(query)
}
function INSERT_DocumentInCollection(document,key,category)
{
    const k = db._query({
        query: `
                INSERT ${document} IN @@ref_col_new
                `,
        bindVars:
            {
                "@ref_col_new": category
            }
    })
    FreeKeys_UpdateOnINSERT(category,key)
}

function DoesDocumentExistsInTargetCollection(target_collection,target_key, expected_response_is_false=false)
{
    if(target_collection!=null && target_collection!=="" && target_key!==null && target_key!=="")
    {
        const {0:res}= db._query(
            {
                query:`return document(to_string(@target_collection), to_string(@target_key))!=null?true:false`,
                bindVars:
                    {
                        "target_collection": target_collection,
                        "target_key": target_key
                    }
            }
        ).toArray()
        if(res ===false&&expected_response_is_false===false)
        {
            Logs.WriteLogMessage(`Target document with _key '${target_key}' in collection '${target_collection}' doesnt exist`)
        }
        return res
    }
    else
    {
        Logs.WriteLogMessage(`Target collection '${target_collection}' or target key '${target_key}' doesnt exist. Check for correctness`)
        return false
    }
}

function DoesPropertyExistsInTargetCollection(target_collection,target_key, expected_response_is_false=false)
{
    if(target_collection!=null && target_collection!=="" && target_key!==null && target_key!=="")
    {
        const {0:res}= db._query(
            {
                query:`let propertyExists = (for prefix in properties_options
return document(@@target_properties_collection,CONCAT(prefix._key,":",@target_property_name)) !=null)
return position(propertyExists, true)`,
                bindVars:
                    {
                        "@target_properties_collection": target_collection,
                        "target_property_name": target_key
                    }
            }
        ).toArray()
        if(res ===false&&expected_response_is_false===false)
        {
            Logs.WriteLogMessage(`Target document with _key '${target_key}' in collection '${target_collection}' doesnt exist`)
        }
        return res
    }
    else
    {
        Logs.WriteLogMessage(`Target collection '${target_collection}' or target key '${target_key}' doesnt exist. Check for correctness`)
        return false
    }
}

function DoesDocumentExistsInTargetEdgeCollection(target_edge_collection,target_to_key, expected_response_is_false=false)
{
    if(target_edge_collection!=null && target_edge_collection!=="" && target_to_key!==null && target_to_key!=="")
    {
        const {0:res}= db._query(
            {
                query:`let doc = (for item in @@target_edge_collection
filter item._to == @target_to_key return item)
return count(doc)>0?
true:
false`,
                bindVars:
                    {
                        "@target_edge_collection": target_edge_collection,
                        "target_to_key": target_to_key
                    }
            }
        ).toArray()
        if(res ===false&&expected_response_is_false===false)
        {
            Logs.WriteLogMessage(`Target edge collection '${target_edge_collection} or target key '_to:${target_to_key}' doesnt exist. Check for correctness `)
        }
        return res
    }
    else
    {
        Logs.WriteLogMessage(`Target edge collection '${target_edge_collection} or target key '_to:${target_to_key}' doesnt exist. Check for correctness `)
        return `Target edge collection '${target_edge_collection}' or target key '_to:${target_to_key}' doesnt exist. Check for correctness `
    }
}

function DoesCollectionExists(target_collection)
{
    if(target_collection!=null && target_collection!=="")
    {
        const {0:res}= db._query(
            {
                query:`return first(collections()[* filter CURRENT.name==to_string(@target_collection) limit 1 return true])==true?true:false`,
                bindVars:
                    {
                        "target_collection": target_collection
                    }
            }
        ).toArray()
        if(res===false)
        {
            Logs.WriteLogMessage(`Category '${target_collection}' doesnt exist in DB`)
        }
        return res
    }
    else
    {
        Logs.WriteLogMessage(`Target collection '${target_collection}' doesnt exist at all. Check for correctness`)
        return false
    }
}


function ViewUpdater(newCollection,viewName="categories")
{
    const view = db._view(viewName)
    view.properties(SFn.GetViewTemplate(newCollection));

}


module.exports.FreeKeys_UpdateOnINSERT=FreeKeys_UpdateOnINSERT;
module.exports.FreeKeys_UpdateOnREMOVE=FreeKeys_UpdateOnREMOVE;
module.exports.INSERT_DocumentInCollection=INSERT_DocumentInCollection;
module.exports.DoesDocumentExistsInTargetCollection=DoesDocumentExistsInTargetCollection;
module.exports.DoesCollectionExists=DoesCollectionExists;
module.exports.ViewUpdater=ViewUpdater;
module.exports.DoesDocumentExistsInTargetEdgeCollection=DoesDocumentExistsInTargetEdgeCollection;
module.exports.DoesPropertyExistsInTargetCollection = DoesPropertyExistsInTargetCollection;