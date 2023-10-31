import express from "express";
/* import config from "config"; */
import "./utils/dbConnect.js";
import dotenv from 'dotenv';
import cors from 'cors';

import rootRouter from "./controllers/index.js"
import adminRouter from "./controllers/admin/index.js";
import userRouter from "./controllers/user/index.js";


dotenv.config();
const app = express()
const port = process.env.ENV_PORT;

// Define a whitelist of allowed origins for CORS
const clientBaseUrls = process.env.REACT_CLIENT_ONLY_URLS.split(',');

const corsOptions = {
  origin: function (origin, callback) {
    if (clientBaseUrls.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};

// Use the configured CORS middleware
app.use(cors(corsOptions)); 

app.use(express.json());

app.get("/", (req, res) => {
  res.send("LMS server!");
});

app.use("/api", rootRouter);
app.use("/api/admin", adminRouter);
app.use("/api/user", userRouter);

app.listen(port, () => {
  console.log(`Server Started at ${port}`);
});
