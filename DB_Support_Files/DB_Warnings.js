'use strict';
module.exports=
{
    CategoryChecks:class
    {
        static UnsupportedCategoryLanguage(targetLanguage)
        {
            console.log(`target language '${targetLanguage}' unsupported in DB. 
            By default output category names on English language`)
            return "en"
        }
    }
}