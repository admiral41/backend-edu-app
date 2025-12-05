const cors = require("cors");

const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:3001",
  ],
  credentials: true,
};

module.exports = (app) => {
  app.use(cors(corsOptions));
};
