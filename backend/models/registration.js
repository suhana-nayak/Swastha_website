const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
    },
    confirm_password: {
      type: String,
    },
    current_password: {
      type: String,
    },
    products: {
      type: [String],
      enum: [
        "SwasthaMedical",
        "SwasthaHospital",
        "SwasthaStree",
        "SwasthaVahan",
      ],
      required: true,
    },
    mobile_number: {
      type: Number,
      required: true,
    },
    registration_type: {
      type: String,
      required: true,
    },
    organization_name: {
      type: String,
    },
    position: {
      type: String,
    },
    enable_download: {
      type: Boolean,
    }
  },
  {
    timestamps: true,
  }
);

const Registration = mongoose.model("registration", registrationSchema);

module.exports = Registration;
