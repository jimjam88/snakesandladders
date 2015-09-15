Game = function(board, interval) {
    this.board = board;
    this.interval = interval || 1000;
    this.timer;
    this.moves = 0;
    this.number = 1;

    this.elements = {
        dice: document.getElementById('dice'),
        info: document.getElementById('info'),
        play: document.getElementById('play')
    };
};

// Add the play button listener
Game.prototype.addPlayButtonListener = function() {
    this.elements.play.addEventListener('click', this.play.bind(this));
};

/**
 * Start the game
 *
 * @return {Void}
 */
Game.prototype.play = function() {
    this.timer = this.repeat(this.roll, this, this.interval);
};

// Roll the dice
Game.prototype.roll = function() {
    this.clearInfo();

    var roll = Math.ceil(Math.random() * 6);

    this.elements.dice.innerHTML = roll;

    this.actuate(roll);

    ++this.moves;
};

// Move the chip
Game.prototype.actuate = function (roll) {
    this.number += roll;

    // Over 100 - remove the actuation
    if (this.number > 100) {
        this.number -= roll;
        this.updateInfo('Over shoot!');
    }

    // Modules 9 - the snake
    else if (this.number % 9 === 0) {
        this.number -= 3;
        this.updateInfo('Snake!');
        this.board.drawChip(this.number);
    }

    // 25 or 55 - the ladder
    else if (this.number === 25 || this.number === 55) {
        this.number += 10;
        this.updateInfo('Ladder!');
        this.board.drawChip(this.number);
    }

    // Game complete
    else if (this.number === 100) {
        clearInterval(this.timer);
        this.updateInfo('Completed in ' + this.moves + ' moves');
        this.board.drawChip(this.number);
    }
    else {
        this.board.drawChip(this.number);
    }
};

// Update the info
Game.prototype.updateInfo = function(text) {
    this.elements.info.innerHTML = text;
};

// Clear the info
Game.prototype.clearInfo = function() {
    this.elements.dice.innerHTML = '';
    this.elements.info.innerHTML = '';
};

// Wrap the setInterval function to keep scope
Game.prototype.repeat = function(callback, scope, timeout) {
    return setInterval(function() {
        callback.call(scope);
    }, timeout);
};
