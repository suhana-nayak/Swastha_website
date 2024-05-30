const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    products: {
      type: [String],
      enum: ["Swastha Medical", "Swastha Hospital", "Swastha Stree", "Swastha Vahan"],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Contact = mongoose.model("contact", contactSchema);

module.exports = Contact;
