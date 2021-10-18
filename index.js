'use strict';
const createRouter = require('@arangodb/foxx/router');
const router = createRouter();
const joi = require('joi');
const db=require('@arangodb').db;
const aql = require('@arangodb').aql;

const SFn = require('./SupportFunctions.js')
const Errors = require('./DB_Support_Files/DB_Errors.js')
const Warnings = require('./DB_Support_Files/DB_Warnings.js')
const Logs=require('./DB_Support_Files/LogsManager.js')

module.context.use(router);

const joi_array = joi.array().items(joi.string().allow(null,''),joi.number())

///////////////////////////////////////////////////////////////////
////// Usablefunctions
//////////////////////////////////////////////

function FreeKeys_UpdateOnINSERT(TargetCollection,InsertedKey)
{
    let query = `let free_keys_doc = document(support_collections_info,'${TargetCollection}')
update free_keys_doc 
with {keys:remove_value(free_keys_doc.keys,'${InsertedKey}')} 
into support_collections_info`
     db._query(query)
}
function FreeKeys_UpdateOnREMOVE(PreviousCollection,RemovedKey)
{
    let query = `let free_keys_doc = document(support_collections_info,'${PreviousCollection}')
update free_keys_doc 
with {keys:append(free_keys_doc.keys,['${RemovedKey}'],true)} 
into support_collections_info`
    db._query(query)
}
function INSERT_DocumentInCollection(document,key,category)
{
    db._query({
        query: `
                INSERT ${document} IN @@ref_col_new
                `,
        bindVars:
            {
                "@ref_col_new": category
            }
    }).then(()=>{FreeKeys_UpdateOnINSERT(category,key)});
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

//////////////////////////////////////////////
//11.2
router.post('/Insert_Items_In_New_Prop',function (req,res){

}).body(joi.required(), 'Array').response(['application/json'],  'POST request.');

router.post( '/Insert_Update_Phone_Item',function (req,res)
{
    let {0:item_category,1:item_key,2:new_phone_item,...other} = req.body

    item_category = item_category?item_category.toLowerCase():null
    const doesTargetDocumentExist = DoesDocumentExistsInTargetCollection(item_category,item_key)
    if(doesTargetDocumentExist===true)
    {
        new_phone_item=new_phone_item==null||new_phone_item===""?
            "":
            SFn.ValidatePhone(new_phone_item)?new_phone_item:"Incorrect phone number format"

        if(new_phone_item!=="" && new_phone_item!=null)
        {
            const {0: result} = db._query(
                {
                    query: `update {_key:to_string(@item_key)} with {phone:@new_phone_number}
in @@target_collection return NEW.phone`,
                    bindVars:
                        {
                            "item_key": item_key,
                            "new_phone_number": new_phone_item,
                            "@target_collection": item_category
                        }
                }
            ).toArray()
            res.send(result)
        }
        else
        {
            Logs.WriteLogMessage(`Phone number cant be ''`)
        }
    }
}).body(joi_array, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.');

// let req =
// [
//     "aaaaa_category_marketing_in_social_web",
//     2,
//     "+7 916-680-77-64"
// ]
// Insert_Update_Phone_Item(req)

// // // 11.1
router.post('/Get_Phone_Item', function(req,res)
{
    let {0:item_category,1:item_key,...other} = req.body

    item_category = item_category?item_category.toLowerCase():null
    const doesTargetDocumentExist = DoesDocumentExistsInTargetCollection(item_category,item_key)
    if(doesTargetDocumentExist===true)
    {
        const{0:result} = db._query(
            {
                query:`return document(@@target_collection,to_string(@item_key)).phone`,
                bindVars:
                    {
                        "item_key": item_key,
                        "@target_collection": item_category
                    }
            }
        ).toArray()
        res.send(result)
    }
}).body(joi_array, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.');
//
// // let req =
// //     [
// //         "aaaaa_category_marketing_in_social_web",
// //         2
// //     ]
// // Get_Phone_Item(req)
// //
//
// ////10.2
router.post('/Insert_Update_Organization_Name_Item' ,function(req,res)
{
    let {0:item_category,1:item_key,2:new_organization_name_item,...other} = req.body

    item_category = item_category?item_category.toLowerCase():null
    const doesTargetDocumentExist = DoesDocumentExistsInTargetCollection(item_category,item_key)
    if(doesTargetDocumentExist===true && new_organization_name_item!=null && new_organization_name_item!=="")
    {
        new_organization_name_item=new_organization_name_item==null||new_organization_name_item===""?
            "organization name is missing":new_organization_name_item

        const{0:result} = db._query(
            {
                query:`update {_key:to_string(@item_key)} with {organization_name:@new_org_name}
in @@target_collection return NEW.organization_name`,
                bindVars:
                    {
                        "item_key": item_key,
                        "new_org_name": new_organization_name_item,
                        "@target_collection": item_category
                    }
            }
        ).toArray()
        console.log(result)
    }
}).body(joi_array, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.');
// // // let req =
// // // [
// // //     "aaaaa_category_marketing_in_social_web",
// // //     2,
// // //     "OWLM organization name"
// // // ]
// // // Insert_Update_Organization_Name_Item(req)
// //
// // // // 10.1
router.post('/Get_Organization_Name_Item',function(req,res)
{
    let {0:item_category,1:item_key,...other} = req.body

    item_category = item_category?item_category.toLowerCase():null
    const doesTargetDocumentExist = DoesDocumentExistsInTargetCollection(item_category,item_key)
    if(doesTargetDocumentExist===true)
    {
        const{0:result} = db._query(
            {
                query:`return document(@@target_collection,to_string(@item_key)).organization_name`,
                bindVars:
                    {
                        "item_key": item_key,
                        "@target_collection": item_category
                    }
            }
        ).toArray()
        console.log(result)
    }
}).body(joi_array, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.');
// // // // let req =
// // // //     [
// // // //         "aaaaa_category_marketing_in_social_web",
// // // //         2
// // // //     ]
// // // // Get_Organization_Name_Item(req)
// // //
// // // //9.2
router.post('/Insert_Update_eMail_Item',function(req,res)
{
    let {0:item_category,1:item_key,2:new_eMail_item,...other} = req.body

    item_category = item_category?item_category.toLowerCase():null
    const doesTargetDocumentExist = DoesDocumentExistsInTargetCollection(item_category,item_key)
    if(doesTargetDocumentExist===true&&new_eMail_item!=null&&new_eMail_item!=="")
    {
        new_eMail_item=new_eMail_item==null||new_eMail_item===""?
            "eMail is missing":
            new_eMail_item=SFn.ValidateEmail(new_eMail_item)?new_eMail_item:"eMail is not validated"

        const{0:result} = db._query(
            {
                query:`update {_key:to_string(@item_key)} with {email:@new_email}
in @@target_collection return NEW.email`,
                bindVars:
                    {
                        "item_key": item_key,
                        "new_email": new_eMail_item,
                        "@target_collection": item_category
                    }
            }
        ).toArray()
        console.log(result)
    }
}).body(joi_array, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.');
// // // // let req =
// // // // [
// // // //     "aaaaa_category_marketing_in_social_web",
// // // //     2,
// // // //     "OWLM_eMail@gmail.com"
// // // // ]
// // // // Insert_Update_eMail_Item(req)
// // //
// // // 9.1
router.post('/Get_eMail_Item',function(req,res)
{
    let {0:item_category,1:item_key,...other} = req.body

    item_category = item_category?item_category.toLowerCase():null
    const doesTargetDocumentExist = DoesDocumentExistsInTargetCollection(item_category,item_key)
    if(doesTargetDocumentExist===true)
    {
        const{0:result} = db._query(
            {
                query:`return document(@@target_collection,to_string(@item_key)).email`,
                bindVars:
                    {
                        "item_key": item_key,
                        "@target_collection": item_category
                    }
            }
        ).toArray()
        console.log(result)
    }
}).body(joi_array, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.');
// //
// // // let req =
// // // [
// // //     "aaaaa_category_marketing_in_social_web",
// // //     2
// // // ]
// // // Get_eMail_Item(req)
// //
// // // 8.2
router.post('/Insert_Update_Company_Name_Item',function(req,res)
{
    let {0:item_category,1:item_key,2:item_new_company_name,...other} = req.body

    item_category = item_category?item_category.toLowerCase():null
    const doesTargetDocumentExist = DoesDocumentExistsInTargetCollection(item_category,item_key)
    if(doesTargetDocumentExist===true && item_new_company_name!==""&& item_new_company_name!=null)
    {
        const{0:result} = db._query(
            {
                query:`update {_key:to_string(@item_key)} with {company_name:@new_company_name}
in @@target_collection return NEW.company_name`,
                bindVars:
                    {
                        "item_key": item_key,
                        "new_company_name": item_new_company_name,
                        "@target_collection": item_category
                    }
            }
        ).toArray()
        console.log(result)
    }
}).body(joi_array, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.');
// // // let req =
// // // [
// // //     "aaaaa_category_marketing_in_social_web",
// // //     2,
// // //     "OWLM"
// // // ]
// // // Insert_Update_Company_Name_Item(req)
// //
// // // 8.1
router.post('/Get_Company_Name_Item',function(req,res)
{
    let {0:item_category,1:item_key,...other} = req.body

    item_category = item_category?item_category.toLowerCase():null
    const doesTargetDocumentExist = DoesDocumentExistsInTargetCollection(item_category,item_key)
    if(doesTargetDocumentExist===true)
    {
        const{0:result} = db._query(
            {
                query:`return document(@@target_collection,to_string(@item_key)).company_name`,
                bindVars:
                    {
                        "item_key": item_key,
                        "@target_collection": item_category
                    }
            }
        ).toArray()
        console.log(result)
    }
}).body(joi_array, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.');
// // // let req =
// // // [
// // //     "aaaaa_category_marketing_in_social_web",
// // //     2
// // // ]
// // // Get_Company_Name_Item(req)
// //
// // // 7.3
router.post('Remove_Presentation_In_Item',function(req,res)
{
    let {0:item_category,1:item_key,2:item_removable_presentations,...other} = req.body

    item_category = item_category?item_category.toLowerCase():null
    const doesTargetDocumentExist = DoesDocumentExistsInTargetCollection(item_category,item_key)
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
        res.send(result)
    }
}).body(joi_array, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.');
// // // let req =
// // // [
// // //     "aaaaa_category_marketing_in_social_web",
// // //     2,
// // //     [
// // //         "S:\\2_University\\1_Education\\3_course\\6_sem\\Одинцова\\UnlockЛК_Предметно-ориентированные_ИС_Тема-2.pdf",
// // //         "S:\\2_University\\1_Education\\3_course\\6_sem\\Одинцова\\UnlockЛК_Предметно-ориентированные_ИС_Тема-5.pdf",
// // //         "S:\\2_University\\1_Education\\3_course\\6_sem\\Одинцова\\UnlockЛК_Предметно-ориентированные_ИС_Тема-1 (1).pdf"
// // //     ]
// // // ]
// // // Remove_Presentation_In_Item(req)
// //
// // // 7.2
router.post('/Insert_New_Presentation_In_Item',function(req,res)
{
    let {0:item_category,1:item_key,2:item_insertable_presentations,...other} = req.body

    item_category = item_category?item_category.toLowerCase():null
    const doesTargetDocumentExist = DoesDocumentExistsInTargetCollection(item_category,item_key)
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
        res.send(result)
    }
}).body(joi.array().items(joi.string().allow(null,''),joi.number(),joi_array), 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.');
// // // let req =
// // // [
// // //     "aaaaa_category_marketing_in_social_web",
// // //     2,
// // //     [
// // //         "S:\\2_University\\1_Education\\3_course\\6_sem\\Одинцова\\UnlockЛК_Предметно-ориентированные_ИС_Тема-1 (1).pdf",
// // //         "S:\\2_University\\1_Education\\3_course\\6_sem\\Одинцова\\UnlockЛК_Предметно-ориентированные_ИС_Тема-2.pdf",
// // //         "S:\\2_University\\1_Education\\3_course\\6_sem\\Одинцова\\UnlockЛК_Предметно-ориентированные_ИС_Тема-3 — копия.pdf",
// // //         "S:\\2_University\\1_Education\\3_course\\6_sem\\Одинцова\\UnlockЛК_Предметно-ориентированные_ИС_Тема-4.pdf",
// // //         "S:\\2_University\\1_Education\\3_course\\6_sem\\Одинцова\\UnlockЛК_Предметно-ориентированные_ИС_Тема-5.pdf"
// // //     ]
// // // ]
// // //
// // // Insert_New_Presentation_In_Item(req)
// //
// //
// // // 7.1
router.post('/Get_Presentations_Item',function(req,res)
{
    let {0:item_category,1:item_key,...other} = req.body

    item_category = item_category?item_category.toLowerCase():null
    const doesTargetDocumentExist = DoesDocumentExistsInTargetCollection(item_category,item_key)
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
    }
}).body(joi_array, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.');
// // // let req =
// // // [
// // //     "aaaaa_category_marketing_in_social_web",
// // //     2
// // // ]
// // // Get_Presentations_Item(req)
// //
// // // 6.3
router.post('/Remove_Images_In_Item',function(req,res)
{
    let {0:item_category,1:item_key,2:item_removable_images,...other} = req.body

    item_category = item_category?item_category.toLowerCase():null
    const doesTargetDocumentExist = DoesDocumentExistsInTargetCollection(item_category,item_key)
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
        console.log(result)
    }
}).body(joi_array, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.');
// // // let req =
// // // [
// // //     "aaaaa_category_marketing_in_social_web",
// // //     2,
// // //     [
// // //         "S:\\4_Images\\Smoke\\2.jpg",
// // //         "S:\\4_Images\\Smoke\\3.jpg"
// // //     ]
// // // ]
// // // Remove_Images_In_Item(req)
// //
// // // 6.2
router.post('Insert_Images_In_Item',function(req,res)
{
    let {0:item_category,1:item_key,2:item_insertable_images,...other} = req.body

    item_category = item_category?item_category.toLowerCase():null
    const doesTargetDocumentExist = DoesDocumentExistsInTargetCollection(item_category,item_key)
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
        console.log(result)
    }
}).body(joi_array, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.');
// // let req =
// // [
// //     "aaaaa_category_marketing_in_social_web",
// //     2,
// //     [
// //         "S:\\4_Images\\Smoke\\2.jpg",
// //         "S:\\4_Images\\Smoke\\3.jpg",
// //         "S:\\4_Images\\Smoke\\1.jpg",
// //     ]
// // ]
// // Insert_Images_In_Item(req)
//
// // 6.1
router.post('Get_Images_Item',function(req,res)
{

    let {0:item_category,1:item_key,...other} = req.body

    item_category = item_category?item_category.toLowerCase():null
    const doesTargetDocumentExist = DoesDocumentExistsInTargetCollection(item_category,item_key)
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
        images_array.forEach(e=>console.log(e))
    }
}).body(joi_array, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.');
// // let req =
// // [
// //     "aaaaa_category_marketing_in_social_web",
// //     2
// // ]
// // Get_Images_Item(req)
//
// // 5.3
router.post('/Remove_Main_Logo_Item',function(req,res)
{
    let {0:item_category,1:item_key,...other} = req.body

    item_category = item_category?item_category.toLowerCase():null
    const doesTargetDocumentExist = DoesDocumentExistsInTargetCollection(item_category,item_key)
    if(doesTargetDocumentExist===true)
    {
        const {0:new_image} = db._query(
            {
                query:`update to_string(@target_key) with {main_logo:@ref_path_main_logo} in @@target_category
return NEW`,
                bindVars:
                    {
                        "target_key": item_key,
                        "ref_path_main_logo":default_image,
                        "@target_category": item_category
                    }
            }
        ).toArray()
        console.log(new_image)
    }
}).body(joi_array, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.');
// let req =
// [
//     "aaaaa_category_marketing_in_social_web",
//     2
// ]
// Remove_Main_Logo_Item(req)

// 5.2
router.post('/Insert_Update_Main_Logo_Item',function(req,res)
{
    const default_image = "S:\\4_Images\\DefaultImage.jpg"

    let {0:item_category,1:item_key,2:item_image_path,...other} = req.body
    item_image_path = item_image_path ==null||item_image_path===""?default_image:item_image_path

    item_category = item_category?item_category.toLowerCase():null
    const doesTargetDocumentExist = DoesDocumentExistsInTargetCollection(item_category,item_key)
    if(doesTargetDocumentExist===true)
    {
        const {0:new_image} = db._query(
            {
                query:`update to_string(@target_key) with {main_logo:@ref_path_main_logo} in @@target_category
return NEW`,
                bindVars:
                    {
                        "target_key": item_key,
                        "ref_path_main_logo":item_image_path,
                        "@target_category": item_category
                    }
            }
        ).toArray()
        console.log(new_image)
    }
}).body(joi_array, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.');
// const req =
// [
//     "aaaaa_category_marketing_in_social_web",
//     2,
//     "S:\\4_Images\\ef6c2cf4811eb8ef6b79f6b5077f4.jpeg"//S:\\4_Images\\uln_vGXMNU8.jpg
//
// ]
// Insert_Update_Main_Logo_Item(req)

// 5.1
router.post('/Get_Main_Logo_Item',function(req,res)
{
    let {0:item_category,1:item_key,...other} = req.body //aaaab_category_push_notifications

    item_category = item_category?item_category.toLowerCase():null
    const doesTargetDocumentExist = DoesDocumentExistsInTargetCollection(item_category,item_key)
    if(doesTargetDocumentExist===true)
    {
        const {0:pathMainLogo} = db._query(
            {
                query:`let main_logo = document(@@target_collection, to_string(@target_key)).main_logo
return main_logo==""||main_logo==null?"Main logo is missing":main_logo`,
                bindVars:
                    {
                        "@target_collection": item_category,
                        "target_key": item_key
                    }
            }
        ).toArray()
        console.log(pathMainLogo)
    }
}).body(joi_array, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.');
// let req =
// [
//     "aaaaa_category_marketing_in_social_web",
//     2
// ]
// Get_Main_Logo_Item(req)

// 4.3
router.post('/Update_Item_Description_In_One_Language',function(req,res)
{
    let {0:item_key,1:item_category,2:target_language,3:new_description,...other} = req.body
    item_category = item_category?item_category.toLowerCase():null
    target_language = SFn.GetTargetLanguageDefence(target_language)
    new_description = new_description!=null&&new_description!==""?new_description:`Description on '${target_language}' language is missing`

    db._query(
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
}).body(joi_array, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.');
// // test
// let req =
// [
//     2,
//     "AAAAA_Category_Marketing_In_Social_Web",
//     "",
//     ""
//
// ]
// Update_Item_Description_In_One_Language(req)

// 4.2
router.post('/Update_Item_Description_In_Every_Language',function(req,res)
{
    let {0:item_key,1:item_category,2:description,...other} = req.body
    item_category = item_category?item_category.toLowerCase():null

    if(Errors.ObjectChecks.ObjectHasProperty(description)===true)
    {
        const doesDocumentExist = DoesDocumentExistsInTargetCollection(item_category, item_key)
        if (doesDocumentExist === true)
        {
            db._query(
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
}).body(joi_array, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.');
// // test 4.2
// let req =
// [
//     2,
//     "AAAAA_Category_Marketing_In_Social_Web",
//     {
//         "de":"Some description on German from JS",
//         "en":"Some description on English from JS",
//         "es":"Some description on Spanish from JS",
//         "fr":"Some description on French from JS",
//         "ru":"Some description on Russian from JS"
//     }
// ]
// Update_Item_Description_In_Every_Language(req)

// 4.1
router.post('/Get_Item_Description',function(req,res)
{
    let {0:item_key,1:item_category,2:target_language,...other} = req.body
    item_category = item_category?item_category.toLowerCase():null
    target_language = SFn.GetTargetLanguageDefence(target_language)

    const doesTargetDocumentExist=DoesDocumentExistsInTargetCollection(item_category,item_key)
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
}).body(joi_array, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.');
// // test 4.1
// let req =
// [
//     2,
//     "AAAAA_Category_Marketing_In_Social_Web",
//     "ru"
//
// ]
// Get_Item_Description(req)

//3.3
router.post('/Insert_Item_In_New_Prop',function(req,res)
{
    let {0:item_key,1:item_id,2:item_category,3:added_properties,4:removable_properties,...other} = req.body
    item_category = item_category?item_category.toLowerCase():null
    added_properties = SFn.Array_To_Lower_Case(added_properties)
    removable_properties=SFn.Array_To_Lower_Case(removable_properties)

    const properties_collection = SFn.ReplaceWord(item_category,'category','properties')

    const doesPropertiesCollectionExists = DoesCollectionExists(properties_collection)
    const doesItemAndCategoryExist = DoesDocumentExistsInTargetCollection(item_category,item_key)

    if(doesItemAndCategoryExist===true && doesPropertiesCollectionExists ===true)
    {
        db._query(
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
        db._query(
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
        db._query(
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
    }
}).body(joi_array, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.');
// // 3.3 test
// key - 5
// col - AAAAA_Category_Marketing_In_Social_Web
// Scheduling_publications, Supports_VK, Supports_Google+
// Publishing_content_to_multiple_channels, Working_with_influencers
// const req =
// [
//     2,
//     "aaaaa_category_marketing_in_social_web/2",
//     "aaaaa_category_marketing_in_social_web",
//     [
//         "publishing_content_to_multiple_channels",
//         "reports_and_analytics",
//         "scheduling_publications",
//         "supports_facebook",
//         "supports_google+",
//     ],
//     [""]
// ]
// Insert_Item_In_New_Prop(req,"")

// // 3.2
router.post('/Insert_New_Property_In_Properties_Collection',function(req,res)
{
    let {0:target_category,1:insertable_property_names,...other}= req
    target_category=target_category.toLowerCase()

    const property_collection = SFn.ReplaceWord(target_category,'category','properties')
    const {0:template_to_parse} = db._query(SFn.GetTemplateDocumentOfCollection("Properties") ).toArray();

    if (Errors.ObjectChecks.ObjectHasProperty(insertable_property_names)) // Defence if key is null
    {
        const property_key = SFn.ReplaceSpacesToUnderscore(insertable_property_names.en.toLowerCase())
        const doesPropertyExist=  DoesDocumentExistsInTargetCollection(property_collection,property_key,true)


        if(doesPropertyExist===false) // defence if document is exist
        {
            let document_template =SFn.ParseDocument(template_to_parse,insertable_property_names.en,true)

            db._query(
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
            // // Previous code
            // db._query(
            //     {
            //         query:`insert ${document_template} in @@target_properties_collection`,
            //         bindVars:
            //             {
            //                 "@target_properties_collection": property_collection
            //             }
            //     }
            // )
            // db._query(
            //     {
            //         query:`let doc = document(@@ref_properties_collection,to_string(@property_key))
            // update doc
            // with {name:merge(doc.name,@property_names)}
            // in @@ref_properties_collection return NEW`,
            //         bindVars:
            //             {
            //                 "@ref_properties_collection": property_collection,
            //                 "property_key": property_key,
            //                 "property_names":insertable_property_names
            //             }
            //     }
            // )
            //
            // // update
        }
        else
        {
            Logs.WriteLogMessage("Document already exist",true)
        }
    }
}).body(joi_array, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.');
// const req =
// [
//     "AAAAA_Category_Marketing_In_Social_Web",
//     {
//         "de":"Property name on German from JS",
//         "en":"Property name on English from JS",
//         "es":"Property name on Spanish from JS",
//         "fr":"Property name on French from JS",
//         "ru":"Property name on Russian from JS"
//     }
// ]
// Insert_New_Property_In_Properties_Collection(req)


////3.1
router.post('/Get_All_Properties',function(req,res)
{
    //3.1
    // #reference to FUNC 2.2
    let {0:category,1:target_language,...other} = req.body//req.body; // MAke this just string like in func 2.2
    category= category.toLowerCase()
    target_language = SFn.GetTargetLanguageDefence(target_language)

    const property_collection = SFn.ReplaceWord(category,'category','properties')

    const props = db._query(
        {
            query:`for property in @@reference_property_collection
RETURN property.name[@target_language]==""?
concat("Missing property name '",property.name['en'], "' on language: '",@target_language,"'"):
property.name[@target_language]`,
            bindVars:
                {
                    "@reference_property_collection": property_collection,
                    "target_language": target_language
                }
        }
    ).toArray()
    for (let prop of props)
    {
        console.log(prop)
    }
    console.log("Some action to send result into C#")
}).body(joi_array, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.');
// // // 3.1 test
// // const req =
// // [
// //     "AAAAA_Category_Marketing_In_Social_Web",
// //     "en"
// // ]
// // Get_All_Properties(req)
//
// //2.3
router.post('/Assignment_Of_A_Category_To_An_Items',function(req,res)
{
    let {0:item_key,1:item_id,2:item_name,3:old_category,4:new_category,...other} = req.body
    old_category = old_category?old_category.toLowerCase():null
    new_category = new_category?new_category.toLowerCase():null

    //2.3.1
    let doesSupportDocumentExist=  DoesDocumentExistsInTargetCollection('support_collections_info',new_category)
    if(doesSupportDocumentExist===true)
    {
        // 2.3.1
        if(item_key>=1)
        {
            //// Change category
            // from category "AAAAA_Category_Marketing_In_Social_Web"
            // we have to move item into category "AAAAB_Category_Push_Notifications"
            //---------
            // Insert item in new category
            // -- Get last index of the aimed category and add 1 (new_key = last_index + 1)
            // -- Insert quoted item in new category
            // Delete quoted item from previously category
            // -- Get quoted item from previously category
            // -- Delete quoted item from previously category
            // -- Delete quoted item from property collection
            let doesTargetDocumentExist = DoesDocumentExistsInTargetCollection(old_category,item_key)
            doesSupportDocumentExist = DoesDocumentExistsInTargetCollection('support_collections_info',old_category)
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
                    item_id = item_id.toLowerCase()
                    db._query(
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
                    ).then(()=>{FreeKeys_UpdateOnREMOVE(old_category,item_key)})

                    doc = SFn.ClearItemProperties(doc)
                    let insertable_document = SFn.ParseDocument(doc,free_key)
                    console.log(insertable_document)
                    INSERT_DocumentInCollection(insertable_document,free_key,new_category)

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
            ////Create new doc explain/ plan
            // find in new_collection
            // get new key = last key + 1
            // get all fields in last file
            const {0:free_key} = db._query(SFn.GetFreeIndex(new_category)).toArray();
            const {0:doc} = db._query(SFn.GetTemplateDocumentOfCollection("Categories") ).toArray();
            let document_template =SFn.ParseDocument(doc,free_key)

            INSERT_DocumentInCollection(document_template,free_key,new_category);
            db._query({
                query: `
                        UPDATE "${free_key}" WITH { name: "${item_name}" } IN @@ref_col_new
                        `,
                bindVars:
                    {
                        "@ref_col_new": new_category
                    }
            });

        }
    }
    else
    {
        Logs.WriteLogMessage(`There is no document in collection:'${new_category}' with key:'${new_category}'`)
    }
}).body(joi_array, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.');
// // // 2.3 test
// //AAAAA_Category_Marketing_In_Social_Web
// //AAAAB_Category_Push_Notifications
// //AAAAC_Category_Web_Analytics
// //const req= [11,"AAAAA_Category_Marketing_In_Social_Web/11","Some Item Name","AAAAB_Category_Push_Notifications","AAAAA_Category_Marketing_In_Social_Web"]
// //const req= [-1,null,"Item_4",null,"AAAAC_Category_Web_Analytics"]
// //const req= [-1,"test_1/3","HELLO","test_1","test_3"]
// // const req= [-1,"222","Item_4",null,"AAAAC_Category_Web_Analytics"]
// // const req=
// // [
// //     -1,
// //     null,
// //     "Item 4",
// //     null,
// //     "aaaaa_category_marketing_in_social_web"
// // ]
// // //
// // Assignment_Of_A_Category_To_An_Items(req)
//
//
// // 2.2
router.post('/Create_New_Category',function(req,res)
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


            db.createCollection(new_category_collection_name)
            db.createCollection(new_property_collection_name)

            db._query(
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
                }
            ).then(()=>
                {
                    ViewUpdater(new_category_collection_name)
                }
            )

        } else {console.log(currentPrefix)}
    }

}).body(joi_array, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.');
// const req =
// [
//     {
//         "de":"Category name on German from JS",
//         "en":"Category name on English from JS",
//         "es":"Category name on Spanish from JS",
//         "fr":"Category name on French from JS",
//         "ru":"Category name on Russian from JS"
//     }
// ]
// Create_New_Category(req)

//ViewUpdater("aaaad_category_category_name_on_english_from_js")


//2.1
router.post('/Get_All_Categories',function(req,res)
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
concat("Missing category name '",c.name['en'], "' on language: '",@target_language,"'"):c.name[@target_language]`,
            bindVars:
                {
                    "target_language":target_language
                }
        }
    ).toArray()

    // Rewrite output for foxx
    for (let cat of cats)
    {
        console.log(cats.indexOf(cat),cat)
    }
}).body(joi_array, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.');
// // 2.1 test
// const req =
// [
//     "dg"
// ]
// Get_All_Categories(req)

//1.2
router.post('/Update_Item_Name',function(req,res)
{
    let {0:item_category,1:item_key,2:new_item_name,...other} = req.body

    item_category = item_category?item_category.toLowerCase():null
    const doesTargetDocumentExist = DoesDocumentExistsInTargetCollection(item_category,item_key)
    if(doesTargetDocumentExist===true)
    {
        new_item_name=new_item_name==null||new_item_name===""?
            "":new_item_name

        if(new_item_name!=="" && new_item_name!=null)
        {
            const {0: result} = db._query(
                {
                    query: `update {_key:to_string(@item_key)} with {name:@new_item_name}
in @@target_collection return NEW.name`,
                    bindVars:
                        {
                            "item_key": item_key,
                            "new_item_name": new_item_name,
                            "@target_collection": item_category
                        }
                }
            ).toArray()
            console.log(result)
        }
        else
        {
            console.log("Phone number cant be ''")
        }
    }
}).body(joi_array, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.');
// let req =
// [
//     "aaaaa_category_marketing_in_social_web",
//     2,
//     "New item name"
// ]
// Update_Item_Name(req)


// 1.1
router.post('/Get_Item_Name',function(req,res)
{
    let {0:item_category,1:item_key,...other} = req.body

    item_category = item_category?item_category.toLowerCase():null
    const doesTargetDocumentExist = DoesDocumentExistsInTargetCollection(item_category,item_key)
    if(doesTargetDocumentExist===true)
    {
        const{0:result} = db._query(
            {
                query:`return document(@@target_collection,to_string(@item_key)).name`,
                bindVars:
                    {
                        "item_key": item_key,
                        "@target_collection": item_category
                    }
            }
        ).toArray()
        console.log(result)
    }
}).body(joi_array, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.');
// // let req =
// //     [
// //         "aaaaa_category_marketing_in_social_web",
// //         2
// //     ]
// // Get_Item_Name(req)
//
// // 0.1
router.post('/Get_Item_File',function(req,res)
{
    let {0:item_category,1:item_key,...other} = req.body

    item_category = item_category?item_category.toLowerCase():null
    const properties_collection = SFn.ReplaceWord(item_category,'category','properties')
    const doesTargetDocumentExist =  DoesDocumentExistsInTargetCollection(item_category,item_key)
    if(doesTargetDocumentExist===true)
    {
        const{0:result} =  db._query(
            {
                query:`let target_item = document(@@target_collection,to_string(@target_item))
return MERGE(target_item, { properties: DOCUMENT(@@target_properties_collection, target_item.properties)[*].name.en } )`,
                bindVars:
                    {
                        "@target_collection": item_category,
                        "target_item": item_key,
                        "@target_properties_collection": properties_collection
                    }
            }
        ).toArray()
        console.log(result)
    }
}).body(joi_array, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.');
// //qwe
// // let req =
// //     [
// //         "aaaaa_category_marketing_in_social_web",
// //         2
// //     ]
// // Get_Item_File(req)
//
