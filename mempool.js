//const bitcoin = require('bitcoinjs-lib')
const bitcoinMessage = require('bitcoinjs-message'); 


class Mempool{
	constructor(){
        this.storage = [];
        this.timeoutRequests = [];
        this.mempoolValid = [];
    }
    addRequestValidation(req) {
        const TimeoutRequestsWindowTime = 1*60*1000;

        let duplicate = false;
        this.storage.forEach(function(element) {    
            if (req.body.address == element.walletAddress) {
                duplicate = true;
                
                let timeElapse = (new Date().getTime().toString().slice(0,-3)) - element.requestTimeStamp;
                let timeLeft = (TimeoutRequestsWindowTime/1000) - timeElapse;
                element.validationWindow = timeLeft;
            }
        });
        if (!duplicate) {
            // build request object with walletAddress, requestTimeStamp, message, validationWindow
            let walletAddress = req.body.address;
            let requestTimeStamp = new Date().getTime().toString().slice(0,-3);
            let message = "19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL:1541605128:starRegistry";
            let validationWindow = TimeoutRequestsWindowTime;
            let request = {
                "walletAddress": walletAddress,
                "requestTimeStamp": requestTimeStamp,
                "message": message,
                "validationWindow": validationWindow

            };
            this.storage.push(request);
        }
        // after 5 minutes remove a request from storage and place in timeoutRequests
        //this.timeoutRequests[req.body.address]=setTimeout(function(){ this.removeValidationRequest(req.body.address)}, TimeoutRequestsWindowTime );

        let request = this.storage.find(function(element) {
            return element.walletAddress == req.body.address;
        });
        return request; 
        
    }

    removeValidationRequest(address) {
        let index = this.storage.indexOf(address);
        if (index > -1) {
            this.storage.splice(index, 1);
        }
        return address;
    }

    validateRequestByWallet(req) {
        let request = this.storage.find(function(element) {
            return element.walletAddress == req.body.address;
        });
        if (request.validationWindow > 0 && bitcoinMessage.verify(request.message, req.body.address, req.body.signature)) {
            // CONTINUE HERE!!!
            let registerStar = true;
            let status = {
                "address": request.walletAddress,
                "requestTimeStamp": request.requestTimeStamp,
                "message": request.message,
                "validationWindow": 200,
                "messageSignature": true
            };
            this.mempoolValid.push(status);
            let validRequest = {
                "registerStar": registerStar,
                "status": status
            }
            
            return validRequest;
        }
    }

    verifyAddressRequest(address) {
        let request = this.mempoolValid.find(function(element) {
            return element.address == address;
        });

        // verify the requst validation exists and if it is valid
        const TimeoutRequestsWindowTime = 1*60*1000;
        let timeElapse = (new Date().getTime().toString().slice(0,-3)) - request.requestTimeStamp;
        let timeLeft = (TimeoutRequestsWindowTime/1000) - timeElapse;
        request.validationWindow = timeLeft;

        return (request.validationWindow > 0 && request.messageSignature);
    }

    

    
}

module.exports.Mempool = Mempool;