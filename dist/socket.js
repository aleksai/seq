var grids = {}

function emptyGrid() {
	return [[[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]]
}

function drawOnGrid(draw, id) {
	var grid = grids[id] || emptyGrid()

	grid[draw[2]][draw[0]][draw[1]] = 1

	grids[id] = grid

	return grid
}

function eraseOnGrid(erase, id) {
	var grid = grids[id] || emptyGrid()

	grid[erase[2]][erase[0]][erase[1]] = 0

	grids[id] = grid

	return grid
}

module.exports = function(io) {

	io.on("connection", socket => {
		socket.on("join", room => {
			for (const sroom of socket.rooms) {
				if (sroom !== socket.id) {
					socket.to(sroom).emit("left", socket.id)
					socket.leave(sroom)
				}
			}

			socket.join(room)
		})

		socket.on("start", reason => {
			for (const room of socket.rooms) {
				if (room !== socket.id) socket.to(room).emit("start", socket.id)
			}
		})

		socket.on("draw", draw => {
			for (const room of socket.rooms) {
				if (room !== socket.id) socket.to(room).emit("grid", drawOnGrid(draw, socket.id))
			}
		})

		socket.on("erase", erase => {
			for (const room of socket.rooms) {
				if (room !== socket.id) socket.to(room).emit("grid", eraseOnGrid(erase, socket.id))
			}
		})

		socket.on("stop", reason => {
			for (const room of socket.rooms) {
				if (room !== socket.id) socket.to(room).emit("stop", socket.id)
			}
		})

		socket.on("disconnecting", reason => {
			for (const room of socket.rooms) {
				if (room !== socket.id) socket.to(room).emit("left", socket.id)
			}
		})
	})

	io.of("/").adapter.on("join-room", (room, id) => {
		io.to(id).emit("joined", room)

		if (room !== id) console.log(id, "joined", room)
	})

}