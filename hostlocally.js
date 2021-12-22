const express = require('express');
//const { curly } = require('node-libcurl')
//const fetch = require('node-fetch');
const path = require('path');
const bodyParser = require('body-parser');  
const app = express();
const port = process.env.PORT || '3001';
const APIaddr = process.env.APIaddr || "https://api.sandbox.checkout.com/payments"
const clientID = process.env.clientID || "ack_o7ymo3py5b2ehkf36vqj7edddm"
const clientSec = process.env.clientSec || "Pmg36sDWQ9WxtPR3"
const clientSk = process.env.sk || "sk_sbox_vueg7yv6ibajwcjbvxp7mfdzgqe" //'sk_test_3e1ad21b-ac23-4eb3-ad1f-375e9fb56481'
const clientpk = process.env.pk ||  "pk_sbox_6e4nist6o5uenuq6ei5dithevqt"
const { Checkout } = require('checkout-sdk-node');
const sendNFT = require("./marketplace")
var details;

app.use(express.static('./public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());
app.use(bodyParser.raw());
var jsonParser = bodyParser.json()


app.get('/', (req, res) => {
  
  res.render('index', {
    cckk: clientpk,
  });
})

app.post('/checkout', jsonParser,  async function (req, res) {

    const cko = new Checkout(clientSk, {pk:clientpk, timeout: 7000});

    (async () => {

      //autentification token request 
      try {
        const transaction = await cko.payments.request({
            source:  {
              type: "token",
              token: req.body.token 
/*                 number: '4242424242424242',
                expiry_month: '12', // req.body.expiry_month,
                expiry_year: '23', //req.body.expiry_year,
                cvv: '100' */
            } ,
/*             customer: {
              email: 'user@email.com',
              name: 'James Bond',
          }, */
            currency:  req.body.currency,
            amount: req.body.amount,
            capture: "false",
            capture_type : "final" ,
            reference: "123456" // order ID
            // https://api-reference.checkout.com/preview/crusoe/#operation/requestAPaymentOrPayout 
        });
        console.log(transaction.id);

        var available_to_capture = "";

        while (available_to_capture == "") { 
          setTimeout(() => { console.log("Waiting 1 secs for capturing "); }, 1000);
          details = await cko.payments.get(transaction.id); // or with session id sid_XX
          var available_to_capture = details.balances.available_to_capture
          console.log("available_to_capture", available_to_capture)
        }

         if (transaction.status === 'Pending' || (transaction.approved == true && transaction.risk.flagged == false)) {
          // The payment is 3DS. Redirect the customer to payment.redirectLink
          // call market   to accepted deposite  &  send NFT
   
           if (await sendNFT(req.body.contractNFT, req.body.tokenID, req.body.amount, req.body.sellerWalletAddress, req.body.targetWalletAddress)) {

          // if all ok       
          //finalizing payment
          // https://api-reference.checkout.com/preview/crusoe/#tag/Payments/paths/~1payments~1{id}~1captures/post

           const transaction2 = await cko.payments.capture( transaction.id);
           await setTimeout(async() => { 
             console.log("Waiting 2 secs for authorizing "); 
             details = await cko.payments.get(transaction.id); 
             console.log("total_authorized", details.balances.total_authorized) 
            }, 2000);
            console.log ("all Ok, finish!");
          }          
          else {
            // uncapture money
            console.log ("Error: NFT didn't send, voiding payment ")
            const transaction2 = await cko.payments.void( transaction.id);
            await setTimeout( async () => { 
              console.log("Waiting 2 secs for void ");   
              details = await cko.payments.get(transaction.id);             
              console.log("details.balances", details.balances)
            }, 2000)
          }
       
        }/*  else if (transaction.approved == true && transaction.risk.flagged == false) {          
          // The payment was successful and not flagged by any risk rule
      //    sendNFT(req.body.contractNFT, req.body.tokenID)
        }  */else if (transaction.approved == true && transaction.risk.flagged == true) {
          console.log ("risk.flagged = TRUE!!!")
          // The payment was successful but it was flagged by a risk rule; this means you have to manually decide if you want to capture it or void it
        } else if (transaction.approved == false) {
          // the payment was declined
          console.log ("transaction.approved == false")
        } 
  
      

  }
      catch (err) {
        console.log(err)
      }


        
    })();

/* 
    const formData = {
      client_id: clientID,
      client_secret: clientSec,
      grant_type: 'client_credentials'
    };
    
    const resp = await fetch(
      `https://access.checkout.com/connect/token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams(formData).toString()
      }
    );
    
    const data = await resp.text();
    console.log(data); */
    
  
});

/**
 * 
 * 
 * sk_sbox_vueg7yv6ibajwcjbvxp7mfdzgqe
pk_sbox_6e4nist6o5uenuq6ei5dithevqt
 * const fetch = require('node-fetch');

const formData = {
  client_id: 'ack_o7ymo3py5b2ehkf36vqj7edddm',
  client_secret: 'Pmg36sDWQ9WxtPR3',
  grant_type: 'client_credentials'
};

const resp = await fetch(
  `https://access.checkout.com/connect/token`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams(formData).toString()
  }
);

const data = await resp.text();
console.log(data);
 */

app.listen(port, () => console.log(`App listening on port ${port}!`));
