const path = require("path");
const os = require("os");

module.exports = function(app) {
  app.use((req, res, next) => {
    if (/\.mid$/.test(req.path)) {
      const file = path.join(os.homedir(), "Downloads", req.path);
      res.sendFile(file);
    } else {
      next();
    }
  });
};
