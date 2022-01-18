'use strict';
const createRouter = require('@arangodb/foxx/router');
const router = createRouter();
const joi = require('joi');
const db=require('@arangodb').db;
const aql = require('@arangodb').aql;
const dd = require('dedent');

const sc=require('./DB_Support_Files/schemas.js')

const DBF_item = require('./DB_Controllers_Functions/ItemFunctions.js');
const DBF_category = require('./DB_Controllers_Functions/CategoryFunctions');
const DBF_property = require('./DB_Controllers_Functions/PropertyFunctions.js');
const DBF_description = require('./DB_Controllers_Functions/DescriptionFunctions.js');
const DBF_mainLogo = require('./DB_Controllers_Functions/MainLogoFunctions.js');
const DBF_images = require('./DB_Controllers_Functions/ImagesFunctions.js');
const DBF_presentations = require('./DB_Controllers_Functions/PresentationFunctions.js');
const DBF_companyName = require('./DB_Controllers_Functions/CompanyNameFunctions.js');
const DBF_eMail = require('./DB_Controllers_Functions/eMailFunctions.js');
const DBF_organizationName = require('./DB_Controllers_Functions/OrganizationNameFunctions.js');
const DBF_phone = require('./DB_Controllers_Functions/PhoneNumberFunctions.js');


module.context.use(router);

//////////////////////////////////////////////
//11.2
// router.post('/Insert_Items_In_New_Prop',function (req,res){
//
// }).body(joi.required(), 'Array').response(['application/json'],  'POST request.');


// // // 11.2
router.post( '/insert_update_phone_item',DBF_phone.insert_update_phone_item)
    .body(sc.string_number, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.')
    .description(dd`Test
    [
        "aaaaa_category_marketing_in_social_web",
        2,
        "+7 916-680-77-64"
    ]`
    );

// // // 11.1
router.post('/get_phone_item', DBF_phone.get_phone_item)
    .body(sc.string_number, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.')
    .description(dd`Test input\n
    [
    "aaaaa_category_marketing_in_social_web",
        2
    ]`);

// ////10.2
router.post('/insert_update_organization_name_item' ,DBF_organizationName.insert_update_organization_name_item)
    .body(sc.string_number, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.')
    .description(dd`Test input\n
    [
    "aaaaa_category_marketing_in_social_web",
    2,
        "OWLM organization name"
    ]`);


// // // // 10.1
router.post('/get_organization_name_item',DBF_organizationName.get_organization_name_item)
    .body(sc.string_number, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.')
    .description(dd`Test input\n
    [
    "aaaaa_category_marketing_in_social_web",
        2
    ]`);

// // // //9.2
router.post('/insert_update_email_item',DBF_eMail.insert_update_email_item)
    .body(sc.string_number, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.')
    .description(dd`Test input\n
    [
    "aaaaa_category_marketing_in_social_web",
    2,
        "OWLM_eMail@gmail.com"
    ]`);


// // // 9.1
router.post('/get_email_item',DBF_eMail.get_email_item)
    .body(sc.string_number, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.')
    .description(dd`Test input\n
    [
    "aaaaa_category_marketing_in_social_web",
        2
    ]`);

// // // 8.2
router.post('/insert_update_company_name_item',DBF_companyName.insert_update_company_name_item)
    .body(sc.string_number, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.')
    .description(dd`Test input\n
    [
    "aaaaa_category_marketing_in_social_web",
    2,
        "OWLM"
    ]`);

// // // 8.1
router.post('/get_company_name_item',DBF_companyName.get_company_name_item)
    .body(sc.string_number, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.')
    .description(dd`Test input\n
    [
    "aaaaa_category_marketing_in_social_web",
        2
    ]`);

// // // 7.3
router.post('remove_presentation_in_item',DBF_presentations.remove_presentation_in_item)
    .body(sc.string_number_array, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.')
    .description(dd`Test input\n
    [
    "aaaaa_category_marketing_in_social_web",
    2,
    [
        "S:\\2_University\\1_Education\\3_course\\6_sem\\Одинцова\\UnlockЛК_Предметно-ориентированные_ИС_Тема-2.pdf",
        "S:\\2_University\\1_Education\\3_course\\6_sem\\Одинцова\\UnlockЛК_Предметно-ориентированные_ИС_Тема-5.pdf",
        "S:\\2_University\\1_Education\\3_course\\6_sem\\Одинцова\\UnlockЛК_Предметно-ориентированные_ИС_Тема-1 (1).pdf"
        ]
    ]`);

// // // 7.2
router.post('/insert_new_presentation_in_item',DBF_presentations.insert_new_presentation_in_item)
    .body(sc.string_number_array, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.')
    .description(dd`Test input\n
    [
    "aaaaa_category_marketing_in_social_web",
    2,
    [
        "S:\\2_University\\1_Education\\3_course\\6_sem\\Одинцова\\UnlockЛК_Предметно-ориентированные_ИС_Тема-1 (1).pdf",
        "S:\\2_University\\1_Education\\3_course\\6_sem\\Одинцова\\UnlockЛК_Предметно-ориентированные_ИС_Тема-2.pdf",
        "S:\\2_University\\1_Education\\3_course\\6_sem\\Одинцова\\UnlockЛК_Предметно-ориентированные_ИС_Тема-3 — копия.pdf",
        "S:\\2_University\\1_Education\\3_course\\6_sem\\Одинцова\\UnlockЛК_Предметно-ориентированные_ИС_Тема-4.pdf",
        "S:\\2_University\\1_Education\\3_course\\6_sem\\Одинцова\\UnlockЛК_Предметно-ориентированные_ИС_Тема-5.pdf"
        ]
    ]`);


// // // 7.1
router.post('/get_presentations_item',DBF_presentations.get_presentations_item)
    .body(sc.string_number, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.')
    .description(dd`Test input\n
    [
    "aaaaa_category_marketing_in_social_web",
        2
    ]`);

// // // 6.3
router.post('/remove_images_in_item',DBF_images.remove_images_in_item)
    .body(sc.string_number_array, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.')
    .description(dd`Test input\n
    [
    "aaaaa_category_marketing_in_social_web",
    2,
    [
        "S:\\4_Images\\Smoke\\2.jpg",
        "S:\\4_Images\\Smoke\\3.jpg"
        ]
    ]`);

// // // 6.2
router.post('insert_images_in_item',DBF_images.insert_images_in_item)
    .body(sc.string_number_array, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.')
    .description(dd`Test input\n
    [
    "aaaaa_category_marketing_in_social_web",
    2,
    [
        "S:\\4_Images\\Smoke\\2.jpg",
        "S:\\4_Images\\Smoke\\3.jpg",
        "S:\\4_Images\\Smoke\\1.jpg",
        ]
    ]`);

// // 6.1
router.post('get_images_item',DBF_images.get_images_item)
    .body(sc.string_number, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.')
    .description(dd`Test input\n
    [
    "aaaaa_category_marketing_in_social_web",
        2
    ]`);

// // 5.3
router.post('/remove_main_logo_item',DBF_mainLogo.remove_main_logo_item)
    .body(sc.string_number, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.')
    .description(dd`Test input\n
    [
    "aaaaa_category_marketing_in_social_web",
        2
    ]`);

// 5.2
router.post('/insert_update_main_logo_item',DBF_mainLogo.insert_update_main_logo_item)
    .body(sc.string_number, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.')
    .description(dd`Test input\n
    [
    "aaaaa_category_marketing_in_social_web",
    2,
    "S:\\4_Images\\ef6c2cf4811eb8ef6b79f6b5077f4.jpeg"//S:\\4_Images\\uln_vGXMNU8.jpg   

]`);

// 5.1
router.post('/get_main_logo_item',DBF_mainLogo.get_main_logo_item)
    .body(sc.string_number, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.')
    .description(dd`Test input\n
    [
    "aaaaa_category_marketing_in_social_web",
        2
    ]`);


// 4.3
router.post('/update_item_description_in_one_language',DBF_description.update_item_description_in_one_language)
    .body(sc.string_number, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.')
    .description(dd`Test input\n
    [
    "AAAAA_Category_Marketing_In_Social_Web",
    2,
    "ru",
    "New description"   

]`);

// 4.2
router.post('/update_item_description_in_every_language',DBF_description.update_item_description_in_every_language)
    .body(sc.object_string_number, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.')
    .description(dd`Test input\n
    [
    "AAAAA_Category_Marketing_In_Social_Web",
    2,
    {
        "de":"Some description on German from JS",
        "en":"Some description on English from JS",
        "es":"Some description on Spanish from JS",
        "fr":"Some description on French from JS",
        "ru":"Some description on Russian from JS"
        }
    ]`);

// 4.1
router.post('/get_item_description',DBF_description.get_item_description)
    .body(sc.string_number, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.')
    .description(dd`Test input\n
    [
    "AAAAA_Category_Marketing_In_Social_Web",
    2,
    "ru"    

]`);

//3.3
router.post('/insert_item_in_new_prop',DBF_property.insert_item_in_new_prop)
    .body(sc.string_number_array, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.')
    .description(dd`Test input\n
    [
    "aaaaa_category_marketing_in_social_web",
     2
    [
        "publishing_content_to_multiple_channels",
        "reports_and_analytics",
        "scheduling_publications",
        "supports_facebook",
        "supports_google+",
    ],
        [""]
    ]`);

// // 3.2
router.post('/insert_new_property_in_properties_collection',DBF_property.insert_new_property_in_properties_collection)
    .body(sc.object_string, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.')
    .description(dd`Test input\n
    [
    "AAAAA_Category_Marketing_In_Social_Web",
    {
        "de":"Property name on German from JS",
        "en":"Property name on English from JS",
        "es":"Property name on Spanish from JS",
        "fr":"Property name on French from JS",
        "ru":"Property name on Russian from JS"
        }
    ]`);


////3.1
router.post('/get_all_properties',DBF_property.get_all_properties)
    .body(sc.string, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.')
    .description(dd`Test input\n
    [
    "AAAAA_Category_Marketing_In_Social_Web",
        "en"
    ]`);

// 2.5
router.post('/get_all_items_in_category',DBF_category.get_all_items_in_category)
    .body(sc.string_number, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.')
    .description(dd`Test input\n
    [
    "aaaaa_category_marketing_in_social_web"
    ]`);

//2.4
router.post('/get_items_amount_of_category',DBF_category.get_items_amount_of_category)
    .body(sc.string_number, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.')
    .description(dd`Test input\n
    [
    "aaaaa_category_marketing_in_social_web"
    ]`);

//2.3
router.post('/assignment_of_a_category_to_an_items',DBF_category.assignment_of_a_category_to_an_items)
    .body(sc.string_number, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.')
    .description(dd`Test input\n
    [
    "aaaaa_category_marketing_in_social_web",
    null,
    -1,
        "Item_name"
    ]`);


// 2.2
router.post('/create_new_category',DBF_category.create_new_category)
    .body(sc.object, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.')
    .description(dd`Test input\n
    [
    {
        "de":"Category name on German from JS",
        "en":"Category name on English from JS",
        "es":"Category name on Spanish from JS",
        "fr":"Category name on French from JS",
        "ru":"Category name on Russian from JS"
        }
    ]`);


//2.1
router.post('/get_all_categories',DBF_category.get_all_categories)
    .body(sc.string, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.')
    .description(dd`Test input\n
    [
        "dg"
    ]`);

//1.4

router.post('/get_short_item_info',DBF_item.get_short_item_info)
    .body(sc.string_number, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.')
    .description(dd`Test input\n
    [
        "aaaaa_category_marketing_in_social_web",
        "ru",
        4
    ]`);

//1.3

router.post('/get_item_info',DBF_item.get_item_info)
    .body(sc.string_number, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.')
    .description(dd`Test input\n
    [
        "aaaaa_category_marketing_in_social_web",
        "ru",
        4
    ]`);
//1.2
router.post('/update_item_name',DBF_item.update_item_name)
    .body(sc.string_number, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.');

// 1.1
router.post('/get_item_name',DBF_item.get_item_name)
    .body(sc.string_number, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.');


//
// router.post('/Get_Item_File',function(req,res)
// {
//     let {0:item_category,1:item_key,...other} = req.body
//
//     item_category = item_category?item_category.toLowerCase():null
//     const properties_collection = SFn.ReplaceWord(item_category,'category','properties')
//     const doesTargetDocumentExist =  DoesDocumentExistsInTargetCollection(item_category,item_key)
//     if(doesTargetDocumentExist===true)
//     {
//         const{0:result} =  db._query(
//             {
//                 query:`let target_item = document(@@target_collection,to_string(@target_item))
// return MERGE(target_item, { properties: DOCUMENT(@@target_properties_collection, target_item.properties)[*].name.en } )`,
//                 bindVars:
//                     {
//                         "@target_collection": item_category,
//                         "target_item": item_key,
//                         "@target_properties_collection": properties_collection
//                     }
//             }
//         ).toArray()
//
//         res.send(result)
//     }
// }).body(sc.string_number, 'This body will be a string.')
//     .response(['application/json'], 'A generic greeting.');
// //qwe
// let req =
//     [
//         "aaaaa_category_marketing_in_social_web",
//         2
//     ]
// // Get_Item_File(req)
//
