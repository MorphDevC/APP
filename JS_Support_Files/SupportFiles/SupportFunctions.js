'use strict';

const Errors = require('../Logs/DB_Errors')
const Warnings = require('../Logs/DB_Warnings')

module.exports=
{

    ParseDocument:function (document,new_key,isKeyEqualsString=false)
    {
        if (!isKeyEqualsString)
        {
            //UnsetSystemVariables(temp_document) //10.10.2021 commented
            UnsetSystemVariables.call(document)
            document._key = new_key
            return JSON.stringify(document)
        }
        else
        {
            UnsetSystemVariables.call(document)
            new_key = this.ReplaceSpacesToUnderscore(new_key)
            document._key = new_key.toLowerCase()
            return JSON.stringify(document)
        }
    },
    ClearItemProperties:function (document)
    {
        if(document.properties ==null)
        {
            console.log("Please check existence document attribute 'properties'")
        }
        else
        {
            document.properties = []
            return document
        }
    },

    GetFreeIndex:function (InsertableCollectionReference)
    {//replace(/\n/g,'')
        const str = `let free_key_index = first(document(support_collections_info,'${InsertableCollectionReference}').keys)
let last_index_key =(free_key_index !=null? free_key_index:to_string(length(${InsertableCollectionReference})+1))
return last_index_key`
        return str//.replace(/\n/g,'')
    },

    GetTemplateDocumentOfCollection:function (TargetTypeCollection)
    {
        const str = `let doc= DOCUMENT(Document_Templates,'${TargetTypeCollection}')
return doc!=null?(return UNSET(doc||{},[]))[0]:
null`

        return str
    },

    GetTargetLanguageDefence:function (Language)
    {
        Language = DB_Support_Languages.includes(Language)===true?Language:
            Warnings.CategoryChecks.UnsupportedCategoryLanguage(Language) //defence from errors
        return Language.toLowerCase()
    },

    ReplaceWord:function (str,targetWord, newWord)
    {
        return str.replace(targetWord,newWord)
    },
    ReplaceSpacesToUnderscore:function (str,isSpacesToReplace=true)
    {
    if(isSpacesToReplace===true)
    {
        const reg = new RegExp(' ','gi')
        return str.replace(reg,'_')
    }
    else
    {
        const reg = new RegExp('_','gi')
        return str.replace(reg,' ')
    }
},
    ReplaceChar:function (str,charSearch,charReplace)
    {

            const reg = new RegExp(charSearch,'gi')
            return str.replace(reg,charReplace)
    },
    CreateNewPrefix:function(oldPref)
    {
        //convert
        var chars = oldPref.toLowerCase().split('');

        const charCodes=[]
        for(let i =0;i<chars.length;i++)
        {
            charCodes.push(chars[i].charCodeAt(0))
            //console.log("arr value: "+charCodes[i])
        }
    //get last index
        let index=charCodes.length-1
    //console.log("index value:"+index)

    // +1 to last
        while(true)
        {
            if(charCodes[index]%122!==0)
            {
                charCodes[index]++
                break
            }else
            {
                charCodes[index]=97
                index--
                if(index<=-1)
                {
                    break
                }
            }
        }
    // Converting inverse
        let charChars =[]
        for(let i =0;i<charCodes.length;i++)
        {
            charChars.push(String.fromCharCode(charCodes[i]))
        }

        let newStringChars=charChars.join("");

        console.log("Old value: "+oldPref)
        console.log("New value: "+newStringChars)
        return newStringChars;
    },
    Array_To_Lower_Case:function (targetArray)
    {
        targetArray.forEach(function(item, index) {
            targetArray[index]=item.toLowerCase();
        });
        return targetArray
    },
    ValidateEmail:function(email)
    {
        const re = /\S+@\S+\.\S+/;
        return re.test(email);
    },
    ValidatePhone:function(phone)
    {
        const re = /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\./0-9]*$/g
        return re.test(phone);
    },
    GetViewTemplate:function (collection)
    {
        let template = {
            links:
                {
                [collection]:
                    {
                        "includeAllFields":false,
                        "analyzers":
                            [
                                "identity",
                                "text_en"
                            ],
                        "fields":
                            {
                                "name": {
                                     "analyzers": [
                                         "text_en",
                                         "identity"]
                                        }
                            }
                    }
                }}
        return template
    }
}

const DB_Support_Languages=["de","en", "es", "fr", "ru"]
function UnsetSystemVariables()
{
    // document._key = ""
    // document._rev = ""
    // document._id=""

    this._key = ""
    this._rev = ""
    this._id=""
}
