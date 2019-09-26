const path = require("path");
const os = require("os");

module.exports = function(app) {
  app.use("/midi/:file", (req, res) => {
    const file = path.join(os.homedir(), `Downloads/${req.params.file}.mid`);
    res.sendFile(file);
  });
};
