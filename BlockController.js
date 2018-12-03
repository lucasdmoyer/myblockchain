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
        this.app.get("/block/:index", (req, res) => {
            // Add your code here
            let block = this.chain.getBlock(req.params.index);
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
        this.app.post("/block", (req, res) => {
            // Add your code here
            let verifiedAddress = this.mempool.verifyAddressRequest(req.body.address);
            if (verifiedAddress) {
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
                let block =  this.chain.addBlock(new simpleChainClass.Block(body));
                //body.star.storyDecoded = hex2ascii(body.star.story);
                res.send(block);
            }   
        });
    }

    // mempool stores an array of address
    submitValidationRequest() {
        this.app.post("/requestValidation", (req, res) => {
            res.send(this.mempool.addRequestValidation(req));
        });
    }

    validate() {
        this.app.post("/message-signature/validate", (req, res) => {
            // send validation request with address and signature
            res.send(this.mempool.validateRequestByWallet(req));
        });
    }

    getByHash() {
        this.app.get("/stars/hash:hash", (req, res) => {
            let block = this.chain.getBlockByHash(req.params.hash);
            if (!block) {
                throw new Error("Block hash does not exist");
            } else {
                res.send(block);
            }
        });
    }

    getByAddress() {
        this.app.get("/stars/address:address", (req, res) => {
            let block = this.chain.getBlockByWalletAddress(req.params.address);
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