async function sendNFT (contractNFT, tokenID, price, sellerWalletAddress, targetWalletAddress  ) {

require('dotenv').config();
const Web3 = require('web3');
const HDWalletProvider = require("@truffle/hdwallet-provider");
const MarketPlace = require("./contracts/MarketPlace.json");
const ERC721 = require("./contracts/ERC721.json");

const pk = process.env.APP_WALLET_PRIVATE_KEY;
const endpoint = process.env.ENDPOINT;
const account =  process.env.ACCOUNT;
const marketplace = process.env.MARKETPLACE;
const chain = process.env.CHAIN;

const providerS =  new HDWalletProvider({
  privateKeys: [pk],  
  providerOrUrl:  endpoint,
  network_id: chain});
const web3 = new Web3(providerS);  

    try {
       
        const mp = new web3.eth.Contract(
            MarketPlace.abi,
            marketplace    );

     const order = await mp.methods.getOrder(contractNFT.toString(), tokenID.toString()).call({from:account});
    //   console.log (order);
     if (order.idCollection == "0x0000000000000000000000000000000000000000") {
  
          console.log ("NFT not found")
         return false;
     }
     else if (order.flagActive == "1") {
    
              //make deposite
              console.log ("OK, order with this NFT found, depositing price ", price)
              await mp.methods.depositKSM (price, sellerWalletAddress).send({from:account/*, gasPrice: "0x01"*/});
              console.log ("Deposite done, buying:  contractNFT, tokenID, sellerWalletAddress, targetWalletAddress: ", contractNFT, tokenID, sellerWalletAddress, targetWalletAddress)
              //buy NFT

              const txBuy = await mp.methods.buyKSM (contractNFT, tokenID, sellerWalletAddress, targetWalletAddress).send({from:account });
              console.log ("buying done, withdrawing to seller")
              await mp.methods.withdrawAllKSM (order.ownerAddr).send({from:account });
              console.log ("withdrawing to seller done")   
            return true;
          } else {

         console.log("NFT is not available for sale: contractNFT, tokenID ", contractNFT, tokenID)
         return false;
         }
          
      } catch (err){
        console.log (err)
        return false;
      
      } 
};

 module.exports = sendNFT;