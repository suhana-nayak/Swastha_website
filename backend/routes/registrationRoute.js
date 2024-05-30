const router = require("express").Router();
const Registration = require("../models/registration");
const EmailTemplate = require("../template/email");

const SibApiV3Sdk = require("sib-api-v3-sdk");
const defaultClient = SibApiV3Sdk.ApiClient.instance;

const apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey = process.env.email_apiKey;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

// Route to add registration
router.post("/add", async (req, res) => {
  try {
    let existingRegistration = await Registration.findOne({
      email: req.body.email,
    });
    if (existingRegistration) {
      return res.status(400).send({ success: false, message: "Email already exists" });
    }

    // Validate and format registration data based on type
    let registrationData;
    if (req.body.registration_type === "individual") {
      registrationData = {
        name: req.body.name,
        email: req.body.email,
        mobile_number: req.body.mobile_number,
        products: req.body.products,
        registration_type: req.body.registration_type,
      };
    } else if (req.body.registration_type === "organization") {
      registrationData = {
        name: req.body.name,
        email: req.body.email,
        organization_name: req.body.organization_name,
        position: req.body.position,
        mobile_number: req.body.mobile_number,
        products: req.body.products,
        registration_type: req.body.registration_type,
      };
    } else {
      return res.status(400).send({ success: false, message: "Invalid registration_type" });
    }

    // Generate OTP
    let otp = Math.floor(100000 + Math.random() * 900000);
    console.log("otp", otp);

    // Save registration data to database
    const savedRegistration = new Registration({
      ...registrationData,
      password: otp,
    });
    await savedRegistration.save();

    // Send verification email
    const sendSmtpEmail = {
      to: [
        {
          name: req.body.name,
          email: req.body.email,
        },
      ],
      subject: EmailTemplate.Email_Subject,
      htmlContent: EmailTemplate.Email_Content(otp),
      sender: {
        name: "Swastha Technovations",
        email: "info@atmaparikshan.com",
      },
      headers: {
        "X-Mailin-custom": "custom_header_1:custom_value_1|custom_header_2:custom_value_2",
      },
    };

    // Send transactional email
    await apiInstance.sendTransacEmail(sendSmtpEmail);

    // Respond with success message
    return res.status(200).send({ success: true, message: "Registration added successfully" });
  } catch (error) {
    console.error("Error adding registration:", error);
    return res.status(500).send({ success: false, message: "Internal server error" });
  }
});

// Route to send document access request email
router.post("/verify/user/sendEmail", async (req, res) => {
  try {
    const { name, email, senderName, senderEmail } = req.body;
    const receiverName = "Suhana Nayak";
    const receiverEmail = "nayaksuhana2001@gmail.com";

    // Validate request payload
    if (!email || !name || !senderName || !senderEmail) {
      return res.status(400).send({
        success: false,
        message: "Name, email, senderName, and senderEmail are required",
      });
    }

    // Construct email data
    const sendSmtpEmail = {
      to: [
        {
          name: receiverName,
          email: receiverEmail,
        },
      ],
      subject: EmailTemplate.Another_Email_Subject,
      htmlContent: EmailTemplate.Another_Email_Content(),
      sender: {
        name: senderName,
        email: senderEmail,
      },
      headers: {
        "X-Mailin-custom": "custom_header_1:custom_value_1|custom_header_2:custom_value_2",
      },
    };

    // Send transactional email
    await apiInstance.sendTransacEmail(sendSmtpEmail);

    // Respond with success message
    return res.status(200).send({ success: true, message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    return res.status(500).send({ success: false, message: "Error sending email" });
  }
});

router.get("/get", async (req, res) => {
  try {
    const savedRegistration = await Registration.find();
    return res.send({ success: true, data: savedRegistration });
  } catch (error) {
    return res.status(500).send({ success: false, message: error.message });
  }
});

router.get("/getByType", async (req, res) => {
  try {
    const { registration_type } = req.query;
    if (!registration_type) {
      return res
        .status(400)
        .send({ success: false, message: "Registration type is required." });
    }
    const savedRegistration = await Registration.find({ registration_type });
    return res.send({ success: true, data: savedRegistration });
  } catch (error) {
    return res.status(500).send({ success: false, message: error.message });
  }
});

router.post("/verify/email", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .send({ success: false, message: "Email and password are required" });
    }

    const user = await Registration.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .send({ success: false, message: "User not found" });
    }

    if (password !== user.password) {
      return res
        .status(400)
        .send({ success: false, message: "Password incorrect" });
    }

    // Return user details upon successful login
    return res.send({
      success: true,
      message: "Login successful",
      user: {
        name: user.name,
        email: user.email,
        mobile: user.mobile_number,
        _id: user._id,
      },
    });
  } catch (error) {
    return res.status(500).send({ success: false, message: error.message });
  }
});

router.put("/update/profile/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, mobile_number } = req.body;
    const updatedUser = await Registration.findByIdAndUpdate(
      userId,
      {
        name,
        mobile_number,
      },
      { new: true }
    );

    if (!updatedUser) {
      return res
        .status(404)
        .send({ success: false, message: "User not found" });
    }

    return res.send({
      success: true,
      message: "User details updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    return res.status(500).send({ success: false, message: error.message });
  }
});

router.put("/update/user/password/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const { current_password, password, confirm_password } = req.body;

    // Find the user by userId
    const user = await Registration.findById(userId);
    if (!user) {
      return res
        .status(404)
        .send({ success: false, message: "User not found" });
    }

    // Check if current_password matches the password stored in the database
    if (current_password !== user.password) {
      return res
        .status(400)
        .send({ success: false, message: "Current password is incorrect" });
    }

    // Check if new password is same as current password
    if (password === current_password) {
      return res.status(400).send({
        success: false,
        message: "New password must be different from current password",
      });
    }

    // Check if password and confirm_password are the same
    if (password !== confirm_password) {
      return res.status(400).send({
        success: false,
        message: "Password and confirm password do not match",
      });
    }

    // Update password only if they match
    const updatedUser = await Registration.findByIdAndUpdate(
      userId,
      { password },
      { new: true }
    );

    if (!updatedUser) {
      return res
        .status(404)
        .send({ success: false, message: "User not found" });
    }

    return res.send({
      success: true,
      message: "User password updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    return res.status(500).send({ success: false, message: error.message });
  }
});

module.exports = router;
