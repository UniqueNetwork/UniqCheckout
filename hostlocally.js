const express = require('express');
//const { curly } = require('node-libcurl')
const fetch = require('node-fetch');
const path = require('path');
const bodyParser = require('body-parser');  
const app = express();
const port = process.env.PORT || '3001';
const APIaddr = process.env.APIaddr || "https://api.sandbox.checkout.com/payments"
const clientID = process.env.clientID || "ack_o7ymo3py5b2ehkf36vqj7edddm"
const clientSec = process.env.clientSec || "Pmg36sDWQ9WxtPR3"



app.use(express.static('./public'));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());
app.use(bodyParser.raw());
var jsonParser = bodyParser.json()

app.post('/checkout', jsonParser,  async function (req, res) {


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
    console.log(data);
    
  
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
