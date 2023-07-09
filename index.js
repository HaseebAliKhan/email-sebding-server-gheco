const {PDFDocument} = require('pdf-lib');
const {readFile, writeFile} = require('fs/promises');
// Require express and body-parser
const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors") // Require cors
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
// Initialize express and define a port
const app = express()
const PORT = 3000

let FileCreated ='No'
const clientId = process.env.CLIENT_ID || '254700513049-pv85sdjep6ln6c7ht8emdfm9qn503o6g.apps.googleusercontent.com';
const clientSecret = process.env.CLIENT_SECRET || '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';

// Create an OAuth2 client object with your credentials
const oauth2Client = new google.auth.OAuth2(
  clientId,
  clientSecret,
  'https://developers.google.com/oauthplayground'
);

let refreshToken = "1//04FaZM_7NnRplCgYIARAAGAQSNwF-L9Ir-pVZTfN3_kYtj1CNR-Wsw9kN2HJI7Hx5plqrbAuSpDeyM0b59i7x3It0O_urNs1p6So"

oauth2Client.setCredentials({
    refresh_token: refreshToken
  });

  async function getAccessToken(refreshToken) {
    try {
      oauth2Client.setCredentials({
        refresh_token: refreshToken
      });
      const response = await oauth2Client.getAccessToken();
      return response.token;
    } catch (error) {
      console.error(error);
    }
  }
  
// Tell express to use body-parser's JSON parsing
app.use(bodyParser.json())

// Use cors middleware
app.use(cors())

// Create a POST route
app.post("/order", async(req, res) => {
  // Get the values from the request body
  const body = req.body
console.log(body);
//{ userPrices, product, quantity, name, address }

  // Do something with the values, such as creating a PDF file

  createPdf(body)


  // Get the refresh token using the authentication code
 
  


  // Send a response
  res.status(200).send("Order received")
})

// Define the createPdf function
async function createPdf(input){
    try{

      let pdfDoc;
      if(input.fileType === 'Large system'){

         pdfDoc = await PDFDocument.load(await readFile('F41A - Solar PV Quotation Large.pdf'));
      }
if(input.fileType === 'Medium system'){

         pdfDoc = await PDFDocument.load(await readFile('F41A - Solar PV Quotation Medium.pdf'));
      }
      if(input.fileType === 'Small system'){

      pdfDoc = await PDFDocument.load(await readFile('F41A - Solar PV Quotation Small.pdf'));
      }

const fields = pdfDoc.getForm().getFields().map((f )=> f.getName())

console.log(
    {fields}
);


const form = pdfDoc.getForm();

// const possibleFields = Array.from({length:46},(_,i)=>i);
// possibleFields.forEach((possibleField)=>{
//     try{
//         form.getTextField(`Text${possibleField}`).setText(possibleField.toString());
//     }catch (error){
//         console.log(error)
//     }
// })

if(input.username && input.surname){

    form.getTextField('Text1').setText(`${input.username} ${input.surname}`)
    form.getTextField('Text4').setText(`${input.username} ${input.surname}`)
}
if(input.address){
    form.getTextField('Text2').setText(`${input.address}`)
}
// if(input.email_address){
//     form.getTextField('Text3').setText(`${input.email_address}`)
// }
const date = new Date();
let day = date.getDate();
let month = date.getMonth() + 1; //January is 0!
let year = date.getFullYear();
let currentDate = `${day}-${month}-${year}`

form.getTextField('Text3').setText(currentDate)
form.getTextField('Text6').setText(currentDate)
// let k=5
// for(let i =0;i<input.products.length;i++){
 

//  console.log(
//     "Products====>",input.products[i]
// );
//     form.getTextField(`Text${k}`).setText(input.products[i])


// k++
// }
// let sum=0
// let j =38
// for(let i =0;i<input.prices.length;i++){
    
    

//     console.log(
//         "Prices====>",input.prices[i]
//     );
            
//             form.getTextField(`Text${j}`).setText(input.prices[i].toString())
//             sum =sum + Number(input.prices[i])
        
//     j++
// }

// form.getTextField(`Text48`).setText(sum.toString())
// sumService = sum + 2220
// form.getTextField(`Text52`).setText(sumService.toString())


        const pdfBytes =await pdfDoc.save();

        await writeFile("F41A - Solar PV Quotation.pdf",pdfBytes);
        console.log('PDF created')
        FileCreated ="Yes"
  // Create an email options object
  
    } catch (err){
        console.log(err);
    }
    
if(FileCreated==="Yes"){

  let mailOptions = {
    from: 'admin@gehco.co.uk',
    to:input.email_address,
    subject:'GHECO Document',
      text:'Doc',
      attachments: [
          {
            filename: 'F41A - Solar PV Quotation.pdf',
            path: '/Field Filler/F41A - Solar PV Quotation.pdf'
          }
        ]
    };
  
    // Create a transporter object with OAuth2 authentication
    let transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        type: 'OAuth2',
        user: 'admin@gehco.co.uk',
        clientId,
        clientSecret,
        refreshToken,
        accessToken: await getAccessToken(refreshToken)
      }
    });
    
    // Send the email using the transporter object
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        // Handle the error and send a response
        console.error(error);
        res.status(500).send('Email failed');
      } else {
        // Log the success and send a response
        //   console.log('Email sent: ' + info.response);
        res.status(200).send('Email sent');
      }
    });
    
  }else{
    console.log("Email didn't sent");
  }
}

// Start express on the defined port
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))






