const express = require("express");
const http = require("http");
const path = require("path");
const app = express();
const server = http.createServer(app);
const socket = require("socket.io");
const io = require("socket.io")(server, {
	cors: {
		origin: "*",
		methods: ["GET", "POST"],
	},
});
const port = process.env.PORT || 5000;
console.log(__dirname);
// app.use(express.static(path.join(__dirname, 'build')));
// app.get('/', function (req, res) {
//     res.sendFile(path.join(__dirname, 'build', 'index.html'));
//   });

// app.use(express.static(path.join(__dirname, 'v/build')));

app.use(express.static(path.join(__dirname,"v","build")));
app.get("*", (req, res) => {
	res.sendFile(path.resolve(__dirname,"v","build", "index.html"));
});
io.on("connection", (socket) => {
	console.log(socket.id);

	socket.emit("me", socket.id);

	socket.on("disconnect", () => {
		socket.broadcast.emit("callEnded");
	});

	socket.on("callUser", (data) => {
		io.to(data.userToCall).emit("callUser", {
			signal: data.signalData,
			from: data.from,
			name: data.name,
		});
	});

	socket.on("answerCall", (data) => {
		io.to(data.to).emit("callAccepted", data.signal);
	});
});

server.listen(port, () => console.log(`server is running on port ${port}`));
