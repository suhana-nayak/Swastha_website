const router = require("express").Router();
const Contact = require("../models/contact");
const SibApiV3Sdk = require("sib-api-v3-sdk");

// Initialize the Sendinblue API client
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey = process.env.email_apiKey;
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

// Function to send email with contact details
async function sendEmail(contactDetails) {
  try {
    const sendSmtpEmail = {
      to: [{ email: "poojaanantha10@gmail.com" }], // Replace with recipient email
      subject: "Contact Form Submission",
      htmlContent: `
                <p><strong>Name:</strong> ${contactDetails.name}</p>
                <p><strong>Email:</strong> ${contactDetails.email}</p>
                <p><strong>Products:</strong> ${contactDetails.products.join(", ")}</p>
                <p><strong>Message:</strong> ${contactDetails.message}</p>
            `, 
            sender: { name: contactDetails.name, email: contactDetails.email } 
        };

        // Send transactional email
        const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log("Email sent successfully:", response);
    } catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Error sending email");
    }
}


// POST route to handle new contact form submissions
router.post("/add", async (req, res) => {
  try {
    // Create a new Contact object with the submitted data
    const savedContact = new Contact(req.body);
    // Save the contact details to the database
    await savedContact.save();

    // Send email with contact details using Sendinblue API
    await sendEmail(savedContact, req.body.name, req.body.email); // Pass name and email from request body

    // Send success response
    return res.send({ success: true, message: savedContact });
  } catch (error) {
    // Send error response if any error occurs
    return res.send({ success: false, message: error.message });
  }
});


module.exports = router;