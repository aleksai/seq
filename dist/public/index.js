var state = {
	playing: false,
	bpm: 180,

	interval: null,

	row: 0,
	column: 0,
	tact: 0
}

var socket;

var sounds = ["kick", "snare", "hihat", "shake"];

var cells = document.querySelectorAll(".grid.my .cell");
var oppcells = document.querySelectorAll(".grid:not(.my) .cell");

var playButton = document.querySelector(".play.button");

var roomInput = document.querySelector("#room");

function getElIndex(el) {
    for (var i = 0; el = el.previousElementSibling; i++);
    return i;
}

function playSound(instrument) {
	var sound  = new Audio();
	var soundSrc  = document.createElement("source");
	soundSrc.type = "audio/mpeg";
	soundSrc.src  = instrument + ".mp3";
	sound.appendChild(soundSrc);

	sound.play();
}

function tick() {
	if(!state.playing) {
		state.row = 0;
		state.column = 0;
		state.tact = 0;

		return
	}

	cells.forEach(cell => {
		var row = getElIndex(cell);
		var column = getElIndex(cell.parentElement);
		var tact = getElIndex(cell.parentElement.parentElement);

		if(column === state.column && tact === state.tact) {
			cell.classList.add("current");

			if(cell.classList.contains("active")) playSound(sounds[row]);
		} else {
			cell.classList.remove("current");
		}
	});

	oppcells.forEach(cell => {
		var row = getElIndex(cell);
		var column = getElIndex(cell.parentElement);
		var tact = getElIndex(cell.parentElement.parentElement);

		if(column === state.column && tact === state.tact) {
			cell.classList.add("current");

			if(cell.classList.contains("active")) playSound(sounds[row]);
		} else {
			cell.classList.remove("current");
		}
	});

	state.column++;

	if(state.column > 3) {
		state.column = 0;

		state.tact++;

		if(state.tact > 3) {
			state.tact = 0;
		}
	}
}

function start(noEmit) {
	noEmit = noEmit || false;

	state.playing = true;

	if(state.interval) clearInterval(state.interval);

	playButton.classList.add("pause");

	state.interval = setInterval(tick, 60 / state.bpm * 1000);

	if(!noEmit) socket.emit("start");
}

function stop(noEmit) {
	noEmit = noEmit || false;

	state.playing = false;

	playButton.classList.remove("pause");

	if(!noEmit) socket.emit("stop");
}

function makeid(length) {
   var result           = '';
   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

function rejoin() {
	var room = roomInput.value.length ? roomInput.value : localStorage.getItem("room");

	if(!room) room = makeid(7);

	localStorage.setItem("room", room);

	socket.emit("join", room);

	roomInput.classList.remove("connected");
	roomInput.classList.remove("error");
}

function init() {
	cells.forEach(cell => {
		cell.addEventListener("click", event => {
			var row = getElIndex(cell);
			var column = getElIndex(cell.parentElement);
			var tact = getElIndex(cell.parentElement.parentElement);

			cell.classList.toggle("active");

			if(cell.classList.contains("active")) playSound(sounds[row]);

			socket.emit(cell.classList.contains("active") ? "draw" : "erase", [row,column,tact]);
		});
	});

	socket = io();

	socket.on("connect", () => {
		rejoin();

		document.querySelector(".join.button").addEventListener("click", rejoin);

		playButton.addEventListener("click", event => {
			if(playButton.classList.contains("pause")) {
				stop();
			} else {
				start();
			}
		});
	})

	socket.on("connect_error", (error) => {
		roomInput.classList.add("error");
		roomInput.classList.remove("connected");
	})

	socket.on("joined", room => {
		roomInput.value = room;
		roomInput.classList.add("connected");
		roomInput.classList.remove("error");
	})

	socket.on("start", room => {
		start(true);
	})

	socket.on("stop", room => {
		stop(true);
	})

	socket.on("grid", grid => {
		oppcells.forEach(cell => {
			var row = getElIndex(cell);
			var column = getElIndex(cell.parentElement);
			var tact = getElIndex(cell.parentElement.parentElement);

			if(grid[tact][row][column]) cell.classList.add("active");
			else cell.classList.remove("active");
		});
	})
}

init();