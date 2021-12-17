
require('dotenv').config();
// const Web3 = require('web3');
const HDWalletProvider = require("@truffle/hdwallet-provider");
const MarketPlace = require("./contracts/MarketPlace.json");
const ERC721 = require("./contracts/ERC721.json");

const pk = process.env.APP_WALLET_PRIVATE_KEY;
const endpoint = process.env.ENDPOINT;
const account =  process.env.ACCOUNT;
const marketplace = process.env.MARKETPLACE;
const chain = process.env.CHAIN;



async function sendNFT (contractNFT, tokenID) {
    try {
        const networkId = await web3.eth.net.getId();
        
        const mp = new web3.eth.Contract(
            MarketPlace.abi,
            marketplace    );
        //const networkId = await web3.eth.net.getId();
    /*     if (networkId != addressMP.net_ID) {
          console.log ("Not right network ", networkId, addressMP.net_ID);
          res.status(500).send("Not right network ", networkId, addressMP.net_ID);
          return;
        } */
     const order = await mp.methods.getOrder(contractNFT.toString(), tokenID.toString()).call({from:account});
    //   console.log (order);
     if (order.idCollection == "0x0000000000000000000000000000000000000000") {
      //  res.status(404).send ("NFT not found");
         /**  
           404	 NFT not found.
          */
     }
     else if (order.flagActive == "1") {
    
              //make deposite
    
              await mp.methods.depositKSM (req.body.price, req.body.sellerWalletAddress).send({from:account, gasPrice: "0x01"});
              //buy NFT
              const txBuy = await mp.methods.buyKSM (contractNFT, tokenID, req.body.sellerWalletAddress, req.body.targetWalletAddress).send({from:account, gasPrice: "0x01"});
              await mp.methods.withdrawAllKSM (order.ownerAddr).send({from:account, gasPrice: "0x01"});
              
         //     res.status(200).json({
         //       "transactionId": txBuy.transactionHash
        //      })
    
          } else {
         // res.status(403).send ("NFT not available for sale"); // 403-  NFT not available for sale.
         }
          
      } catch (err){
      //    res.status(500).send(err);
      } //5XX	 Something went wrong
}

//  export  {sendNFT};