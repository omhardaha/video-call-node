import React, { useEffect, useRef, useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import Peer from "simple-peer";
import io from "socket.io-client";
import "./App.css";
import DoneIcon from "@mui/icons-material/Done";
import Skeleton from "@mui/material/Skeleton";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { blue } from "@mui/material/colors";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import GitHubIcon from "@mui/icons-material/GitHub";
import { Link } from "react-router-dom";
// const socket = io.connect("http://localhost:5000");
const socket = io.connect("https://nodejs-video-call-om.herokuapp.com/");
function App() {
	console.log("react Running");
	const [me, setMe] = useState("");
	const [stream, setStream] = useState();
	const [open, setOpen] = useState(false);
	const [receivingCall, setReceivingCall] = useState(false);
	const [caller, setCaller] = useState("");
	const [callerSignal, setCallerSignal] = useState();
	const [callAccepted, setCallAccepted] = useState(false);
	const [idToCall, setIdToCall] = useState("");
	const [callEnded, setCallEnded] = useState(false);
	const [name, setName] = useState("");
	const myVideo = useRef();
	const userVideo = useRef();
	const connectionRef = useRef();

	useEffect(() => {
		navigator.mediaDevices
			.getUserMedia({ video: true, audio: true })
			.then((stream) => {
				setStream(stream);
				myVideo.current.srcObject = stream;
			});
		socket.on("me", (id) => {
			setMe(id);
		});

		socket.on("callUser", (data) => {
			setReceivingCall(true);
			setCaller(data.from);
			setName(data.name);
			setCallerSignal(data.signal);
		});
	}, []);

	const callUser = (id) => {
		const peer = new Peer({
			initiator: true,
			trickle: false,
			stream: stream,
		});
		peer.on("signal", (data) => {
			socket.emit("callUser", {
				userToCall: id,
				signalData: data,
				from: me,
				name: name,
			});
		});
		peer.on("stream", (stream) => {
			userVideo.current.srcObject = stream;
		});
		socket.on("callAccepted", (signal) => {
			setCallAccepted(true);
			peer.signal(signal);
		});
		connectionRef.current = peer;
	};

	const answerCall = () => {
		setCallAccepted(true);
		const peer = new Peer({
			initiator: false,
			trickle: false,
			stream: stream,
		});
		peer.on("signal", (data) => {
			socket.emit("answerCall", { signal: data, to: caller });
		});
		peer.on("stream", (stream) => {
			userVideo.current.srcObject = stream;
		});

		peer.signal(callerSignal);
		connectionRef.current = peer;
	};

	const leaveCall = async () => {
		setCallAccepted(false);
		setCallEnded(true);
		connectionRef.current.destroy();
		userVideo.current.srcObject = null;
	};

	const copyClipboard = () => {
		setOpen(true);
		console.log("hit");
	};

	return (
		<>
			<div className="cameras">
				<Grid
					container
					spacing={{ xs: 2, md: 3 }}
					columns={{ xs: 4, sm: 12, md: 12 }}
				>
					<Grid item xs={12} sm={12} md={6}>
						<div
							direction="row"
							onClick={copyClipboard}
							spacing={3}
							className="camera1down alcenter"
						>
							<h1 className="heading1">Your Cam</h1>
							<div className="flex">
								<CopyToClipboard text={me}>
									<div className="id">
										<Button>
											<ContentCopyIcon
												fontSize="small"
												sx={{ color: blue[300] }}
												className="alcenter"
											></ContentCopyIcon>
										</Button>
										{`ID - ${me}`}
									</div>
								</CopyToClipboard>
								{open && <DoneIcon></DoneIcon>}
							</div>
						</div>
						<div className="camera1">
							<video className="border" ref={myVideo} autoPlay="true" muted />
						</div>
					</Grid>
					<Grid item xs={12} sm={12} md={6}>
						{callAccepted && <h1>User Cam</h1>}
						{callAccepted ? (
							<>
								<video className="border" ref={userVideo} autoPlay="true" />
							</>
						) : (
							<Box sx={{ width: "-webkit-fill-available" }}>
								<Skeleton />
								<Skeleton animation="wave" />
								<Skeleton animation={false} />
								<Skeleton />
								<Skeleton animation="wave" />
								<Skeleton animation={false} />
								<Skeleton />
								<Skeleton animation="wave" />
								<Skeleton animation={false} />
							</Box>
						)}
						<div className="camerup2" direction="row" spacing={2}>
							<div>
								<TextField
									className="text"
									color="warning"
									variant="standard"
									label="Enter Your Name"
									value={name}
									onChange={(e) => setName(e.target.value)}
								/>
							</div>
							<div>
								<TextField
									color="warning"
									id="standard-basic"
									variant="standard"
									label="ID to call"
									value={idToCall}
									onChange={(e) => setIdToCall(e.target.value)}
								/>
							</div>
							<div>
								<div className="call-button">
									{callAccepted && !callEnded ? (
										<Button
											variant="contained"
											color="error"
											onClick={leaveCall}
										>
											End Call
										</Button>
									) : (
										<Button
											onClick={() => callUser(idToCall)}
											variant="outlined"
											color="primary"
										>
											Call
										</Button>
									)}
								</div>
							</div>
						</div>
						<div className="camerup2" direction="row" spacing={2}>
							<div>
								{receivingCall && !callAccepted ? (
									<div className="caller">
										<h1>{name} is calling...</h1>
										<Button
											className="margtop20"
											variant="contained"
											color="success"
											onClick={answerCall}
										>
											Answer
										</Button>
									</div>
								) : null}
							</div>
						</div>
					</Grid>
				</Grid>
			</div>
			<div className="myId"></div>
			<div className="footer">
				<a
					href="https://github.com/omhardaha"
					target="_blank"
					rel="noopener noreferrer"
				>
					<GitHubIcon></GitHubIcon>/omhardaha
				</a>
			</div>
		</>
	);
}

export default App;
