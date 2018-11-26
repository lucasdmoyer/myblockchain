
const SHA256 = require('crypto-js/sha256');
//Importing levelSandbox class
const LevelSandboxClass = require('./levelSandbox.js');


class Block{
	constructor(data){
     this.hash = "",
     this.height = 0,
     this.body = data,
     this.time = 0,
     this.previousBlockHash = ""
    }
}


class Blockchain{
  constructor(){
    this.bd = new LevelSandboxClass.LevelSandbox();
    this.addBlock(new Block("First block in the chain - Genesis block"));
  }

  // Add new block
  addBlock(newBlock){
    // Block height
    newBlock.height = 1 + this.getBlockHeight();
    // UTC timestamp
    newBlock.time = new Date().getTime().toString().slice(0,-3);
    // previous block hash
    if(1 + this.getBlockHeight() > 0){
      newBlock.previousBlockHash = this.bd.getLevelDBData(this.getBlockHeight()).hash;
    }
    // Block hash with SHA256 using newBlock and converting to a string
    newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
    // Adding block object to chain
  	this.bd.addLevelDBData(newBlock.height, JSON.stringify(newBlock).toString());
  }

  // Get block height
    getBlockHeight(){
      return this.bd.getBlocksCount();
    }

    // get block
    getBlock(blockHeight){
      // return object as a single string
      return JSON.parse(JSON.stringify(this.bd.getLevelDBData(blockHeight)));
    }

    // validate block
    async validateBlock(blockHeight){
      // get block object
      let block = this.getBlock(blockHeight);
      // get block hash
      let blockHash = block.hash;
      // remove block hash to test block integrity
      block.hash = '';
      // generate block hash
      let validBlockHash = SHA256(JSON.stringify(block)).toString();
      // Compare
      if (blockHash===validBlockHash) {
          return true;
        } else {
          console.log('Block #'+blockHeight+' invalid hash:\n'+blockHash+'<>'+validBlockHash);
          return false;
        }
    }

   // Validate blockchain
    validateChain(){
      let errorLog = [];
      for (var i = 0; i < this.getBlockHeight()-1; i++) {
        // validate block
        if (!this.validateBlock(i))errorLog.push(i);
        // compare blocks hash link

        let blockHash = this.getBlock(i).hash;
        let previousHash = this.getBlock(i+1).previousBlockHash;
        if (blockHash!==previousHash) {
          errorLog.push(i);
        }
      }
      if (errorLog.length>0) {
        console.log('Block errors = ' + errorLog.length);
        console.log('Blocks: '+errorLog);
      } else {
        console.log('No errors detected');
      }
    }
}