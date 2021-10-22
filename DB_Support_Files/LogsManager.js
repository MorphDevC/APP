'use strict';

const fs = require('fs');
const path = require('path');
const logs = path.join(__dirname,'logs.txt');


module.exports=
    {
        WriteLogMessage:function (message,isWarning=false)
        {
            let date = GetDateAndTime()
            switch (isWarning)
            {
                case true:
                    message=`"WARNING"\n${date}\n${message}\n\n`
                    break;
                case false:
                    message=`"ERROR"\n${date}\n${message}\n\n`
                    break
                default:
                    break;
            }

            fs.append(logs, `${message}`);

        }
    }

function GetDateAndTime()
{
    let date = new Date();

    let hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    let min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    let sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    let year = date.getFullYear();

    let month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    let day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return year + ":" + month + ":" + day + "---" + hour + ":" + min + ":" + sec;

}