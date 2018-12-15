//const bitcoin = require('bitcoinjs-lib')
const bitcoinMessage = require('bitcoinjs-message'); 


class Mempool{
	constructor(){
        this.storage = [];
        this.timeoutRequests = [];
        this.mempoolValid = [];
    }

    // called from /requestValidation
    addRequestValidation(req) {
        const TimeoutRequestsWindowTime = 5*60*1000;

        let duplicate = false;
        this.storage.forEach(function(element) {    
            if (req.body.address == element.walletAddress) {
                duplicate = true;
                
                let timeElapse = (new Date().getTime().toString().slice(0,-3)) - element.requestTimeStamp;
                let timeLeft = (TimeoutRequestsWindowTime/1000) - timeElapse;
                if (timeLeft < 0) {
                    this.removeValidationRequest(req.body.address);
                    this.timeoutRequests.push(element);
                }
                element.validationWindow = timeLeft;
            }
        });
        if (!duplicate) {
            // build request object with walletAddress, requestTimeStamp, message, validationWindow
            let walletAddress = req.body.address;
            let requestTimeStamp = new Date().getTime().toString().slice(0,-3);
            let message = req.body.address + ":" + requestTimeStamp + ":starRegistery";
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
            let registerStar = true;
            const TimeoutRequestsWindowTime = 5*60*1000;
            let timeElapse = (new Date().getTime().toString().slice(0,-3)) - request.requestTimeStamp;
            let timeLeft = (TimeoutRequestsWindowTime/1000) - timeElapse;
            let status = {
                "address": request.walletAddress,
                "requestTimeStamp": request.requestTimeStamp,
                "message": request.message,
                "validationWindow": timeLeft,
                "messageSignature": true
            };
            this.mempoolValid.push(status);
            let validRequest = {
                "registerStar": registerStar,
                "status": status
            }
            
            return validRequest;
        } else {
            return false;
        }
    }

    verifyAddressRequest(address) {
        let request = this.mempoolValid.find(function(element) {
            return element.address == address;
        });

        // verify the requst validation exists and if it is valid
        const TimeoutRequestsWindowTime = 5*60*1000;
        let timeElapse = (new Date().getTime().toString().slice(0,-3)) - request.requestTimeStamp;
        let timeLeft = (TimeoutRequestsWindowTime/1000) - timeElapse;
        request.validationWindow = timeLeft;

        return (request.validationWindow > 0 && request.messageSignature);
    }

    

    
}

module.exports.Mempool = Mempool;