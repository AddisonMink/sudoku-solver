"use strict";

// These are examples of acceptable sudoku strings. The string should be all 9
// rows of the puzzle concatenated from top to bottom, with '.' representing an
// empty space.
// ..3.2.6..9..3.5..1..18.64....81.29..7.......8..67.82....26.95..8..2.3..9..5.1.3..
// 4.....8.5.3..........7......2.....6.....8.4......1.......6.3.7.5..2.....1.4......
// 85...24..72......9..4.........1.7..23.5...9...4...........8..7..17..........36.4.

// GLOBAL VARIABLES
var cells = {};		// Mapping of indeces to cell objects.

// Clone a board state.
function deep_copy_state(old_state)
{
	var new_state = {};
	Object.keys(old_state).forEach(function(index)
	{
		new_state[index] = {};
		new_state[index].input = old_state[index].input;
		new_state[index].peers = old_state[index].peers;
		new_state[index].domain = new Set();
		Array.from(old_state[index].domain).forEach(function(val)
		{
			new_state[index].domain.add(val);
		});
	});
	return new_state;
}

// Help menu.
var help = "Enter a sudoku puzzle into the grid and press the \"SOLVE\" button to see the solution.\n\nAlternatively, you can enter a puzzle as a string in the \"Text Input\" field.\n\nThe string should be a contatenation of all the rows in the puzzle. Use the \".\" character\nto represent an empty cell";

// Create the 9x9 sudoku board.
function createBoard()
{
	var board = document.getElementById("board");
	board.style.backgroundColor = "darkgray";

	// Create a queue of indeces to assign inputs to.
	var indeces = [];
	for(var i = 1; i <= 7; i += 3)
		for(var j = 1; j <= 7; j += 3)
			for(var k = i; k < i+3; k++)
				for(var l = j; l < j+3; l++)
					indeces.push(k.toString() + l.toString());

	// Helper function to create 3x3 sub-board.
	function createSubBoard()
	{
		var subBoard = document.createElement("table");
		subBoard.className = "subBoard";

		var subBoardIndeces = [];
		for(var i = 0; i < 9; i++)
			subBoardIndeces.push(indeces.shift());

		for(var i = 0; i < 3; i++)
		{
			var subRow = document.createElement("tr");
			for(var j = 0; j < 3; j++)
			{
				var cell = document.createElement("td");
				cell.className = "cell";
				cell.style.backgroundColor = "lightgray";
				var input = document.createElement("input");
				input.className = "cellInput";
				input.style.backgroundColor = "lightgray";
				cell.appendChild(input);
				cells[subBoardIndeces[i*3+j]] = {peers: subBoardIndeces, input: input, domain: new Set(["1","2","3","4","5","6","7","8","9"])};
				subRow.appendChild(cell);
			}
			subBoard.appendChild(subRow);
		}
		return subBoard;
	}

	// Create a 3x3 table of sub-boards.
	for(var i = 0; i < 3; i++)
	{
		var row = document.createElement("tr");
		for(var j = 0; j < 3; j++)
		{
			var data = document.createElement("td");
			data.appendChild(createSubBoard());
			row.appendChild(data);
		}
		board.appendChild(row);
	}

	// Finish building the lists of peers of each cell.
	Object.keys(cells).forEach(function(index)
	{
		var new_peers = new Set(cells[index].peers);

		var row = index[0];
		for(var j = 1; j <= 9; j++)
			new_peers.add(row + j.toString());

		var col = index[1];
		for(var i = 1; i <= 9; i++)
			new_peers.add(i.toString() + col);

		new_peers.delete(index);

		cells[index].peers = Array.from(new_peers);
	});
}

// Create the "solve" button.
function create_solve_button()
{
	// Read text input into the cell inputs.
	function read_text_input()
	{
		var text = document.getElementById("string_input").value;
		if(text.length != 81)
		{
			alert("Error: A valid puzzle must be exactly 81 characters long.");
			return false;
		}
		var regex = /[123456789\.]/;
		for(var i = 1; i <= 9; i++)
			for(var j = 1; j <= 9; j++)
			{
				var character = text[(i-1)*9+j-1];
				if(!regex.test(character))
				{
					alert("Error: \"" + character + "\" is not a valid character.");
					return false;
				}
				if(character != ".")
					cells[i.toString()+j.toString()].input.value = character;
			}
		return true;
	}

	// Set the button to its initial state.
	var solve_button = document.getElementById("solve");
	solve_button.style.backgroundColor = "lightgreen";

	// The button chagnes to a lighter color while it is pressed.
	solve_button.addEventListener("mousedown", function()
	{
		if(this.innerHTML == "SOLVE")
			this.style.backgroundColor = "#CCFFD9";
		else
			this.style.backgroundColor = "lightgray";
	});

	// The button returns to its normal color after the mouse leaves it.
	solve_button.addEventListener("mouseleave", function()
	{
		if(this.innerHTML == "SOLVE")
			this.style.backgroundColor = "lightgreen";
		else
			this.style.backgroundColor = "darkgray";
	});

	// In the "solve" state, the puzzle is solved when the button is pressed.
	// In the "reset" state, the board is returned to its original state.
	solve_button.addEventListener("mouseup", function()
	{
		if(this.innerHTML == "SOLVE")
		{
			var valid = true;
			if(document.getElementById("string_input").value.length > 0)
				valid = read_text_input();
			else
			{
				var regex = /\d?/;
				var list = Object.keys(cells);
				for(var x = 0; x < list.length; x++)
					if(!regex.test(cells[list[x]].input.value))
					{
						valid = false;
						alert("Error: " + cells[list[x]].input.value + " is not a valid character.");
						break;
					}
			}
			if(valid)
				solve();
			else
			{
				console.log("invalid puzzle.")
				this.style.backgroundColor = "lightgreen";
				return;
			}

			this.style.backgroundColor = "darkgray";
			this.innerHTML = "RESET";


		}
		else
		{
			Object.keys(cells).forEach(function(index)
			{
				cells[index].domain = new Set(["1","2","3","4","5","6","7","8","9"]);
				cells[index].input.value = "";
				cells[index].input.style.backgroundColor = "lightgray";
			});
			document.getElementById("string_input").value = "";

			this.style.backgroundColor = "lightgreen";
			this.innerHTML = "SOLVE";
		}
	});
}

// Create a button that will display instructions in an alert when pressed.
function create_help_button()
{
	var button = document.getElementById("help");
	button.style.backgroundColor = "darkgray";
	button.addEventListener("mousedown",function(){this.style.backgroundColor = "lightgray";});
	button.addEventListener("mouseleave",function(){this.style.backgroundColor = "darkgray";});
	button.addEventListener("mouseup",function()
	{
		this.style.backgroundColor = "darkgray";
		alert(help);
	});
}

function solve()
{
	// Assign a value to a cell and perform constrain propagation.
	function assign(state, index, val)
	{
		// Queue of assignments to be made.
		var assignment_queue = [{index: index, val: val}];

		// Remove a value from all peers of a cell.
		// If a cell's domain is reduced to zero, return false.
		// If a cell's domain is reduced to size 1, queue an assignment to that cell.
		function constrain(index, val)
		{
			var success = true;
			state[index].peers.forEach(function(i)
			{
				if(state[i].domain.delete(val))
				{
					if(state[i].domain.size == 0)
						success = false;
					else if(state[i].domain.size == 1)
						assignment_queue.push({index: i, val: Array.from(state[i].domain)[0]});
				}
			});
			return success;
		}

		// Make assignments until the assignment queue is empty.
		while(assignment_queue.length > 0)
		{
			var assignment = assignment_queue.shift();
			if(!state[assignment.index].domain.has(assignment.val))
				return null;
			state[assignment.index].domain = new Set([assignment.val]);
			if(!constrain(assignment.index, assignment.val))
				return null;
		}
		return state;
	}

	// Perform a greedy search of all possible assignment sequences until a solution is found.
	function search()
	{
		var states = [cells];
		while(states.length > 0)
		{
			// Pop a state from the stack.
			var state = states.shift();

			// Goal test.
			var goal = true;
			var goal_keys = Object.keys(state);
			for(var x = 0; x < goal_keys.length; x++)
				if(state[goal_keys[x]].domain.size != 1)
				{
					goal = false;
					break;
				}
			if(goal)
				return state;

			// Find theindex of the unassigned cell with the smallest domain.
			var min = 9;
			var i = null;
			Object.keys(state).forEach(function(index)
			{
				if(state[index].domain.size < min && state[index].domain.size > 1)
				{
					min = state[index].domain.size;
					i = index;
				}
			});
			if(i == null)
				i = "11";

			// Perform all possible assignments to that cell and push those assignments onto the stack.
			Array.from(state[i].domain).forEach(function(val)
			{
				// MAKE SURE THAT EACH STATE PASSED TO ASSIGN IS A COPY OF THE STATE POPPED FROM THE STACK AND NOT A REFERENCE TO IT.
				var new_state = assign(deep_copy_state(state), i, val);
				if(new_state != null)
					states.unshift(new_state);
			});
		}
		return null;
	}

	// Perform initial assignments.
	var original_inputs = [];
	Object.keys(cells).forEach(function(index)
	{
		if(cells[index].input.value != "")
		{
			assign(cells, index, cells[index].input.value);
			original_inputs.push(cells[index].input);
		}
	});

	// Goal test.
	var goal = true;
	var cell_keys = Object.keys(cells);
	for(var i = 0; i < cell_keys.length; i++)
		if(cells[cell_keys[i]].domain.size != 1)
		{
			goal = false;
			break;
		}

	// Solve the puzzle.
	var solution = undefined;
	if(!goal)
		solution = search();
	else
		solution = cells;

	// Display the results.
	var success = true;
	if(solution == null)
	{
		solution = cells;
		success = false;
	}
	Object.keys(solution).forEach(function(index)
	{
		if(solution[index].domain.size == 1)
			solution[index].input.value = Array.from(solution[index].domain)[0];
		solution[index].input.style.backgroundColor = "lightgreen";
	});
	original_inputs.forEach(function(input)
	{
		input.style.backgroundColor = "lightgray";
	});
	return success;
}
