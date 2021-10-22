'use strict';
const Logs=require('./LogsManager.js')

module.exports=
{
    ObjectChecks:class
    {
        static ObjectHasProperty(obj)
        {
            if(obj.hasOwnProperty('en')===true)
            {
                if (obj.en!=null && obj.en!=="")
                {
                    return true
                }
                else
                {
                    Logs.WriteLogMessage("Object property 'en' has value null or spaces instead. " +
                        "Please, enter a value in property 'en'." +
                        "Example: {'en':'Some value'} ")
                }
            }
            else
            {
                Logs.WriteLogMessage(`Object is missing property 'en'.`)
            }
            return false
        }
    }
}
