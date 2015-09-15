Board = function(canvas, boardSize) {
    // The board size
    this.boardSize = boardSize || 500;

    // The size of each cell
    this.cellSize  = this.boardSize / 10;

    // The current cell number the the chip resides in
    this.number = 1;

    // The chip data
    this.chip = this.getInitialChipState();

    // Set the canvas size
    canvas.height = canvas.width = this.boardSize;

    // Define the context
    this.context = canvas.getContext('2d');

    // Draw the board
    this.draw();
};

// Intial chip state getter
Board.prototype.getInitialChipState = function() {
    return {
        size: 20,
        previous: {
            image: false,
            x: 0,
            y: 0
        },
        current: {
            image: false,
            x: 0,
            y: 0
        }
    };
};

// Draw the board on the canvas
Board.prototype.draw = function() {
    this.drawGrid();
    this.drawNumbers();
    this.drawSnakes();
    this.drawLadders();
    this.drawChip(1);
};

/**
 * Draw a line on the canvas
 *
 * @param  {Integer} fromX The from X co-ordinate
 * @param  {Integer} fromY The from Y co-ordinate
 * @param  {Integer} toX   The to X co-ordinate
 * @param  {Integer} toY   The to Y co-ordinate
 * @param  {String}  color The stroke color
 * @return {void}
 */
Board.prototype.drawLine = function(fromX, fromY, toX, toY, color) {
    this.context.beginPath();
    this.context.strokeStyle = color;
    this.context.moveTo(fromX, fromY);
    this.context.lineTo(toX, toY);
    this.context.stroke();
    this.context.closePath();
};

// Draw the grid on the board
Board.prototype.drawGrid = function() {
    var i, color = '#ddd';

    for (i = 0; i <= this.boardSize; i += this.cellSize) {
        this.drawLine(0, i, this.boardSize, i, color);
        this.drawLine(i, 0, i, this.boardSize, color);
    }
};

// Add the numbers to the cells
Board.prototype.drawNumbers = function() {
    var x, y, xPos, yPos, n = 1, offset = 0.1, fontSize = 12;

    this.context.font = 'bold ' + fontSize + 'px Arial';
    this.context.fillStyle = '#aaa';

    for (y = offset; y <= 10; ++y) {
        for (x = offset; x <= 10; ++x) {
            // You'll notice on the board that the numbers alternate direction on
            // each line. This is the nature of the snakes and ladders board.
            if ((y - offset) % 2 !== 1) {
                // Left to right
                xPos = x * this.cellSize ;
                yPos = this.boardSize - (y * this.cellSize);
            } else {
                // Right to left
                xPos = this.boardSize - (x * this.cellSize) - (this.cellSize - fontSize - offset);
                yPos = this.boardSize - (y * this.cellSize);
            }

            this.context.fillText(n++, xPos, yPos);
        }
    }
};

// Draw the snakes on the canvas
Board.prototype.drawSnakes = function() {
    var n, start, end, color = '#F44336', offset = this.blockSize / 2;

    for (n = 9; n <= 100; n += 9) {
        start = this.getGridPosition(n);
        end = this.getGridPosition(n - 3);

        this.drawLine(start.x, start.y, end.x, end.y, color);

        this.context.fillStyle = color;
        this.context.fillRect(start.x - 3, start.y - 3, 6, 6);
    }
};

// Get the position on the x-axis given a cell number
Board.prototype.getXposition = function(number) {
    // This is whole function is awful but can't think of a better way.
    // A mathematician is required!
    var i, j, xPositions = [
        [1,20,21,40,41,60,61,80,81,100],
        [2,19,22,39,42,59,62,79,82,99],
        [3,18,23,38,43,58,63,78,83,98],
        [4,17,24,37,44,57,64,77,84,97],
        [5,16,25,36,45,56,65,76,85,96],
        [6,15,26,35,46,55,66,75,86,95],
        [7,14,27,34,47,54,67,74,87,94],
        [8,13,28,33,48,53,68,73,88,93],
        [9,12,29,32,49,52,69,72,89,92],
        [10,11,30,31,50,51,70,71,90,91]
    ];

    for (i = 0; i < xPositions.length; i++) {
        for (j = 0; j < xPositions[i].length; j++) {
            if (xPositions[i][j] === number) {
                if (i < 1) {
                    return this.cellSize / 2;
                }

                return (this.cellSize * (i + 1)) - (this.cellSize / 2);
            }
        }
    }

    throw new Error(number + ' is not on the board!');
};

// Get the position on the y-axis given a cell number
Board.prototype.getYposition = function(number) {
    // Get the next multiple of 10
    var mod10 = number % 10;
    var multiple = mod10 === 0 ? number : number - mod10 + 10;

    return this.boardSize - ((multiple / 10) * this.cellSize) + (this.cellSize / 2);
};

// Get the x and y vertices given a cell number
Board.prototype.getGridPosition = function(number) {
    return {
        x: this.getXposition(number),
        y: this.getYposition(number)
    };
};

// Draw a ladder
Board.prototype.drawLadder = function(number) {
    var color = '#4CAF50',
        start = this.getGridPosition(number),
        end = this.getGridPosition(number + 10);

    this.drawLine(start.x, start.y, end.x, end.y, color);

    this.context.fillStyle = color;
    this.context.fillRect(start.x - 3, start.y - 3, 6, 6);
};

// Draw the ladders
Board.prototype.drawLadders = function() {
    this.drawLadder(25);
    this.drawLadder(55);
};

// Draw a chip on the board
Board.prototype.drawChip = function(number) {
    var vertices = this.getGridPosition(number),
        offset = this.chip.size / 2,
        x = vertices.x - offset,
        y = vertices.y - offset;

    // Backup the background
    this.backupChipBackground(number, x, y);

    this.chip.current.x = x;
    this.chip.current.y = y;

    this.context.fillStyle = '#03A9F4';
    this.context.fillRect(x, y, this.chip.size, this.chip.size);

    // Restore the last background
    this.restorePreviousChipBackground(number);

    this.number = number;
};

// Backup the background where the chip is going to move to
Board.prototype.backupChipBackground = function(number, x, y) {
    if (number !== this.number || number === 1) {
        this.chip.previous.image = this.chip.current.image;
        var offset = this.chip.size / 2;
        this.chip.previous.x = this.chip.current.x;
        this.chip.previous.y = this.chip.current.y;

        return this.chip.current.image = this.context.getImageData(
            x,
            y,
            this.chip.size,
            this.chip.size
        );
    }

    // The chip position did not change
    this.chip.current.image = this.chip.previous.image;
};

// Restore the previous chip background (where the chip has moved from)
Board.prototype.restorePreviousChipBackground = function(number) {
    if (number !== this.number && this.chip.previous.image) {
        // Restore the background
        this.context.putImageData(
            this.chip.previous.image,
            this.chip.previous.x,
            this.chip.previous.y
        );
    }
};
