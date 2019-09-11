import * as fs from 'fs';
import * as path from 'path';
import { loader } from "webpack";


const INCUDE_XTML_KEY = "@include-xtml:";

export default async function (this: loader.LoaderContext, source: string) {
    const callback = this.async()!;

    try {
        var config = JSON.parse(source);

        processXtmlFiles(config, this.resourcePath, ['content']);
    } catch(e) {
        callback(new Error(e.message));
        return;
    }

    callback(null, JSON.stringify(config));
}


function processXtmlFiles(config: any, baseResourcePath: string, keys: string[]) {
    if(config instanceof Array) {
        for(var i = 0; i < config.length; i++) {
            processXtmlFiles(config[i], baseResourcePath, keys);
        }
    }
    else
    {
        for(var prop in config) {
            if(keys.indexOf(prop) != -1 ) {
                if(typeof config[prop] === 'string') {
                    let filePath=  config[prop].replace(INCUDE_XTML_KEY, "");

                    if(!path.isAbsolute(filePath)){
                        filePath = path.resolve(baseResourcePath, filePath);
                    }
                    let fileContent = processXtmlFile(filePath);
                    fileContent = fileContent.replace(/[\""]/g, '\\"').replace( /[\r\n\x0B\x0C\u0085\u2028\u2029]+/g, " ");
                    config[prop] = fileContent;
                }
            }
            if(config[prop] instanceof Object || config[prop] instanceof Array) {
                processXtmlFiles(config[prop], baseResourcePath, keys);
            } 
        }
    }
}

function processXtmlFile(filePath: string) {
    let data = fs.readFileSync(filePath).toString();

    const includeScriptRegex = /<\s{0,1}!@include:(ts|js) .* \/>/g;
    const scriptPathPropertyName = 'file';

    data = data.replace(includeScriptRegex, (matched, index, original) => {
        var attributes = getElementAttributes(matched);
        let scriptPath = attributes[scriptPathPropertyName];
        if(scriptPath){
            if(!path.isAbsolute(scriptPath)){
                scriptPath = path.resolve(path.dirname(filePath), scriptPath);
            }
            let scriptData = fs.readFileSync(scriptPath).toString();
            return scriptData;
        } else {
            return matched;
        }
      });

    return data;
}


function getElementAttributes(elementStr: string): any {
    let result = {};

    let attrArray = elementStr.split(' ').map(s => s.split('=')).filter(x => x.length === 2);
    
    for(let i = 0; i < attrArray.length; i++){
        result[attrArray[i][0]] = attrArray[i][1].replace(/(^(”|"))|((”|")$)/g, '');
    }

    return result;
}