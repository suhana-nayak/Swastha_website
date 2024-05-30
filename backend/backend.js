const express = require("express");
const app = express();
const port = process.env.PORT || 4000;
require("dotenv").config();
const dbConfig = require("./config/dbConfig");
app.use(express.json());

const cors = require("cors");
app.use(cors());

const contactRoute = require("./routes/contactRoute");
const registrationRoute = require("./routes/registrationRoute");

app.use("/api/contact", contactRoute);
app.use("/api/registration", registrationRoute);

app.listen(port, () => console.log(`Server is running on port ${port}`));
