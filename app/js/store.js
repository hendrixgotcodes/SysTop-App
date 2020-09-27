const electron = require('electron');
const path = require('path');
const fs = require('fs');

class STORE {

    constructor(opts) {
        const userDataPath = (electron.app || electron.remote.app).getPath('userData');
        this.path = path.join(userDataPath, opts.configName + '.json');
        this.data = parseData(path, opts.defaults);
    }

    get(KEY) {
        return this.data[KEY];
    }
    set(KEY, val) {
        this.data[KEY] = val;

        try {

            fs.writeFileSync(this.path, JSON.stringify(this.data));

        } catch (error) {
            console.log(error);
        }
    }

}

function parseData(path, defaults){
    try {

        return JSON.parse(fs.readFileSync(path))
        
    } catch (error) {
        console.log(error);    
        return defaults;    
    }
}

module.exports = STORE;