const SHA256 = require('crypto-js/sha256');
const bitcoinMessage = require('bitcoinjs-message');
const hex2ascii = require('hex2ascii')
const simpleChainClass = require('./simpleChain.js')
const mempoolClass = require('./mempool.js')


/**
 * Controller Definition to encapsulate routes to work with blocks
 */
class BlockController {

    /**
     * Constructor to create a new BlockController, you need to initialize here all your endpoints
     * @param {*} app 
     */
    constructor(app) {
        this.app = app;
        // this.blocks = [];
        // this.initializeMockData();
        this.chain = new simpleChainClass.Blockchain();
        this.mempool = new mempoolClass.Mempool();
        this.getBlockByIndex();
        this.postNewBlock();
        this.submitValidationRequest();
        this.validate();
        this.getByHash();
        this.getByAddress();
    }

    /**
     * Implement a GET Endpoint to retrieve a block by index, url: "/api/block/:index"
     */
    getBlockByIndex() {
        this.app.get("/block/:index", async(req, res) => {
            // Add your code here
            let block = await this.chain.getBlock(req.params.index);
            if (!block) {
                throw new Error("Block height does not exist");
            } else {
                res.send(block);
            }
        });
    }

    /**
     * Implement a POST Endpoint to add a new Block, url: "/api/block"
     */
    postNewBlock() {
        this.app.post("/block", async (req, res) => {
            // Add your code here
            //let verifiedAddress = this.mempool.verifyAddressRequest(req.body.address);

            // check for dec and ra
            if (!req.body.star.dec || !req.body.star.ra) {
                res.send("Error. No dec or ra, please add");
            }
            // check is story is at most 250 characters and ASCII
            let asciiCheck = /^[\x00-\x7F]*$/.test(req.body.star.story);
            if (!asciiCheck || req.body.star.length > 250) {
                res.send("Error. Either the story is not ascii or it is above 250 characters in length");
            }

            //if (verifiedAddress) {
            if (true) {
                let body = {
                    address: req.body.address,
                    star: {
                        ra: req.body.star.ra,
                        dec: req.body.star.dec,
                        mag: req.body.star.mag,
                        cen: req.body.star.cen,
                        story: Buffer(req.body.star.story).toString('hex'),
                    }
                }
                let block =  await this.chain.addBlock(new simpleChainClass.Block(body));
                //body.star.storyDecoded = hex2ascii(body.star.story);
                res.send(block);
            } else {
                res.send("Not a verified address");
            }
        });
    }

    // mempool stores an array of address
    submitValidationRequest() {
        this.app.post("/requestValidation", (req, res) => {
            if (!req.body.address) {
                res.send("Error, empty address");
            } else {
                res.send(this.mempool.addRequestValidation(req));
            }
        });
    }

    validate() {
        this.app.post("/message-signature/validate", (req, res) => {
            // send validation request with address and signature
            if (!req.body.address || !req.body.signature) {
                res.send("error, no address or signature");
            } else {
                res.send(this.mempool.validateRequestByWallet(req));
            }
        });
    }

    getByHash() {
        this.app.get("/stars/hash:hash", async (req, res) => {
            let hashOnly = req.params.hash.slice(1);
            let block = await this.chain.getBlockByHash(hashOnly);
            if (!block) {
                throw new Error("Block hash does not exist");
            } else {
                res.send(block);
            }
        });
    }

    getByAddress() {
        this.app.get("/stars/address:address", async (req, res) => {
            let addressOnly = req.params.address.slice(1);
            let block = await this.chain.getBlockByWalletAddress(addressOnly);
            if (!block) {
                throw new Error("Block address does not exist");
            } else {
                res.send(block);
            }
        });
    }
    
  

    /**
     * Help method to inizialized Mock dataset, adds 10 test blocks to the blocks array
     */
    initializeMockData() {
        if(this.blocks.length === 0){
            for (let index = 0; index < 10; index++) {
                let blockAux = new BlockClass.Block(`Test Data #${index}`);
                blockAux.height = index;
                blockAux.hash = SHA256(JSON.stringify(blockAux)).toString();
                this.blocks.push(blockAux);
            }
        }
    }

}

/**
 * Exporting the BlockController class
 * @param {*} app 
 */
module.exports = (app) => { return new BlockController(app);}