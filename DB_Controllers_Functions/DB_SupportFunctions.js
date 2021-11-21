'use strict';
const Logs = require("./../DB_Support_Files/LogsManager.js");
const SFn = require("./../SupportFunctions.js");
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