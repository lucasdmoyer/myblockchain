# To run this project

Run npm init to install dependencies then run node app.js
App is running on http://localhost:8000


# Blockchain Data

Blockchain has the potential to change the way that the world approaches data. Develop Blockchain skills by understanding the data model behind Blockchain by developing your own simplified private blockchain.

### Prerequisites

Installing Node and NPM is pretty straightforward using the installer package available from the (Node.js® web site)[https://nodejs.org/en/].

### Configuring your project

- Use NPM to initialize your project and create package.json to store project dependencies.
```
npm init
```

## Testing
The project can be tested by running node app.js in the directory
The following endpoints are available
POST - takes an address
localhost:8000/requestValidation
POSTS - takes an address and  signature
localhost:8000/message-signature/validate
POST - takes a JSON object of a star
localhost:8000/block/

GET
localhost:8000/block/[blockheight]
GET
localhost:8000/stars/hash:[hash]
GET
localhost:8000/stars/address:[address]