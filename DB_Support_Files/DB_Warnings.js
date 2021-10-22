'use strict';
const Logs=require('./LogsManager.js')
module.exports=
{
    CategoryChecks:class
    {
        static UnsupportedCategoryLanguage(targetLanguage)
        {
            Logs.WriteLogMessage(`target language '${targetLanguage}' unsupported in DB. By default output category names on English language`)
            return "en"
        }
    }
}