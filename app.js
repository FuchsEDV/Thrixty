const express = require("express");
const app = express();
const port = 3000;

app.use(express.static("."));
app.use("/thrixty", express.static("thrixty"));
app.use("/example", express.static("example"));

app.listen(port, () => {
    console.log("Thrixty listening on port " + port);
})