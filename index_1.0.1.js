'use strict';
const createRouter = require('@arangodb/foxx/router');
const router = createRouter();
const joi = require('joi');
const db=require('@arangodb').db;
const aql = require('@arangodb').aql;
const dd = require('dedent');

const sc=require('./DB_Support_Files/schemas.js')

const DBF_itemName = require('./DB_Controllers_Functions/ItemNameFunctions.js');
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
router.post( '/Insert_Update_Phone_Item',DBF_phone.Insert_Update_Phone_Item)
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
router.post('/Get_Phone_Item', DBF_phone.Get_Phone_Item)
    .body(sc.string_number, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.');

// ////10.2
router.post('/Insert_Update_Organization_Name_Item' ,DBF_organizationName.Insert_Update_Organization_Name_Item)
    .body(sc.string_number, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.');


// // // // 10.1
router.post('/Get_Organization_Name_Item',DBF_organizationName.Get_Organization_Name_Item)
    .body(sc.string_number, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.');

// // // //9.2
router.post('/Insert_Update_eMail_Item',DBF_eMail.Insert_Update_eMail_Item)
    .body(sc.string_number, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.');


// // // 9.1
router.post('/Get_eMail_Item',DBF_eMail.Get_eMail_Item)
    .body(sc.string_number, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.');

// // // 8.2
router.post('/Insert_Update_Company_Name_Item',DBF_companyName.Insert_Update_Company_Name_Item)
    .body(sc.string_number, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.');

// // // 8.1
router.post('/Get_Company_Name_Item',DBF_companyName.Get_Company_Name_Item)
    .body(sc.string_number, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.');

// // // 7.3
router.post('Remove_Presentation_In_Item',DBF_presentations.Remove_Presentation_In_Item)
    .body(sc.string_number_array, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.');

// // // 7.2
router.post('/Insert_New_Presentation_In_Item',DBF_presentations.Insert_New_Presentation_In_Item)
    .body(sc.string_number_array, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.');


// // // 7.1
router.post('/Get_Presentations_Item',DBF_presentations.Get_Presentations_Item)
    .body(sc.string_number, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.');

// // // 6.3
router.post('/Remove_Images_In_Item',DBF_images.Remove_Images_In_Item)
    .body(sc.string_number_array, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.');

// // // 6.2
router.post('Insert_Images_In_Item',DBF_images.Insert_Images_In_Item)
    .body(sc.string_number_array, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.');

// // 6.1
router.post('Get_Images_Item',DBF_images.Get_Images_Item)
    .body(sc.string_number, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.');

// // 5.3
router.post('/Remove_Main_Logo_Item',DBF_mainLogo.Remove_Main_Logo_Item)
    .body(sc.string_number, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.');

// 5.2
router.post('/Insert_Update_Main_Logo_Item',DBF_mainLogo.Insert_Update_Main_Logo_Item)
    .body(sc.string_number, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.');

// 5.1
router.post('/Get_Main_Logo_Item',DBF_mainLogo.Get_Main_Logo_Item)
    .body(sc.string_number, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.');


// 4.3
router.post('/Update_Item_Description_In_One_Language',DBF_description.Update_Item_Description_In_One_Language)
    .body(sc.string_number, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.');

// 4.2
router.post('/Update_Item_Description_In_Every_Language',DBF_description.Update_Item_Description_In_Every_Language)
    .body(sc.object_string_number, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.');

// 4.1
router.post('/Get_Item_Description',DBF_description.Get_Item_Description)
    .body(sc.string_number, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.');

//3.3
router.post('/Insert_Item_In_New_Prop',DBF_property.Insert_Item_In_New_Prop)
    .body(sc.string_number_array, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.');

// // 3.2
router.post('/Insert_New_Property_In_Properties_Collection',DBF_property.Insert_New_Property_In_Properties_Collection)
    .body(sc.object_string, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.');


////3.1
router.post('/Get_All_Properties',DBF_property.Get_All_Properties)
    .body(sc.string, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.');

//2.3
router.post('/Assignment_Of_A_Category_To_An_Items',DBF_category.Assignment_Of_A_Category_To_An_Items)
    .body(sc.string_number, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.');


// 2.2
router.post('/Create_New_Category',DBF_category.Create_New_Category)
    .body(sc.object, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.');


//2.1
router.post('/Get_All_Categories',DBF_category.Get_All_Categories)
    .body(sc.string, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.');


//1.2
router.post('/Update_Item_Name',DBF_itemName.Update_Item_Name)
    .body(sc.string_number, 'This body will be a string.')
    .response(['application/json'], 'A generic greeting.');

// 1.1
router.post('/Get_Item_Name',DBF_itemName.Get_Item_Name)
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
