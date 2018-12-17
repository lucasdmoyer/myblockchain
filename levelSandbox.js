/* ===== Persist data with LevelDB ==================
|  Learn more: level: https://github.com/Level/level |
/===================================================*/
// Importing the module 'level'
const level = require('level');
// Declaring the folder path that store the data
const chainDB = './chaindata';
// Declaring a class
class LevelSandbox {
	// Declaring the class constructor
    constructor() {
    	this.db = level(chainDB);
    }
  
    // get block by hash
    getBlockByHash(hash) {
        let self = this;
        let block = null;
        return new Promise(function(resolve, reject){
            self.db.createReadStream()
            .on('data', function (data) {
                if(JSON.parse(data.value).hash === hash){
                    block = data.value;
                }
            })
            .on('error', function (err) {
                reject(err)
            })
            .on('close', function () {
                resolve(block);
            });
        });
    }

    getBlockByWalletAddress(address) {
        let self = this;
        let block = null;
        return new Promise(function(resolve, reject){
            let result = [];
            self.db.createReadStream()
            .on('data', function (data) {
                if(JSON.parse(data.value).body.address === address){
                    block = data.value;
                }
            })
            .on('error', function (err) {
                reject(err)
            })
            .on('close', function () {
                resolve(block);
            });
        });
    }

  	// Get data from levelDB with a key (Promise)
  	getLevelDBData(key){
        let self = this; // Because we are returning a promise, we will need this to be able to reference 'this' inside the Promise constructor
        return new Promise(function(resolve, reject) {
            self.db.get(key, (err, value) => {
                if(err){
                    if (err.type == 'NotFoundError') {
                        resolve(undefined);
                    }else {
                        console.log('Block ' + key + ' get failed', err);
                        reject(err);
                    }
                }else {
                    resolve(value);
                }
            });
        });
    }
  
  	// Add data to levelDB with key and value (Promise)
    addLevelDBData(key, value) {
        let self = this;
        return new Promise(function(resolve, reject) {
            self.db.put(key, value, function(err) {
                if (err) {
                    console.log('Block ' + key + ' submission failed', err);
                    reject(err);
                }
                resolve(value);
                
            });
        });
    }
  
  	// Implement this method
    getBlocksCount() {
        let self = this;
        return new Promise(function(resolve, reject) {
            var size = 0;
            self.db.createReadStream({ reverse: true})
                .on('data', function (data) {
                    // Count each object inserted
                    //console.log(data)
                    size = size + 1;
                })
                .on('error', function (err) {
                    // reject with error
                    reject(err)
                })
                .on('close', function () {
                    // resolve with the count value
                    resolve(size)
                });
        });
      }
}

// Export the class
module.exports.LevelSandbox = LevelSandbox;