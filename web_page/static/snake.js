const snake_block = 30;
const screen_width = 1920;
const screen_height = 1080;

const board_border = 'green';
const board_background = "black";
const snake_col = 'green';
const snake_border = 'white';

let snake = [
    {x: 300, y: 300},
    {x: 270, y: 300},
    {x: 240, y: 300}
]

let changing_direction = false;
let dx = snake_block;
let dy = 0;

let score = 0;
let player = "jee";
let gameMsg = "";

// Food location
let food_x;
let food_y;

// Get the canvas element
const snakeboard = document.getElementById("snakeboard");

//snakeboard.width  = window.innerWidth;
//snakeboard.height = window.innerHeight;

// Return a two dimensional drawing context
const snakeboard_ctx = snakeboard.getContext("2d");


document.cookie="player";
document.cookie="score";


main();
gen_food();

document.addEventListener("keydown", change_direction);
document.addEventListener("keydown", gameProcess);

// main function called repeatedly to keep the game running
function main() {

    if (has_game_ended()){
        gameMsg = "You died, press C to try again!";
        document.getElementById("output").innerHTML = gameMsg;
        ajaxCall();
    }
    else {
        changing_direction = false;
        setTimeout(function onTick()
        {
            clear_board();
            drawFood();
            move_snake();
            drawSnake();
            // Call me again
            main();
        }, 100)
    }
}


function gameProcess (event) {
    const KEY_C = 67;
    if (has_game_ended()) {
        const keyPressed = event.keyCode;
        if (keyPressed === KEY_C) {
            restartGame();
        }
    }
}


function ajaxCall () {
    const request = new XMLHttpRequest();
    request.open('POST', '/_get_post_score', true);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.onreadystatechange = function() {
        // do something
    };
    request.send('score=' + score);
}

function restartGame() {
    snake = [
    {x: 300, y: 300},
    {x: 270, y: 300},
    {x: 240, y: 300}
    ]

    changing_direction = false;
    dx = snake_block;
    dy = 0;

    score = 0;
    gameMsg = "";

    document.getElementById("score").innerHTML = score
    document.getElementById("output").innerHTML = gameMsg;

    main();
    gen_food();
}

// draw a border around the canvas
function clear_board() {
    //  Select the colour to fill the drawing
    snakeboard_ctx.fillStyle = board_background;
    //  Select the colour for the border of the canvas
    snakeboard_ctx.strokestyle = board_border;
    // Draw a "filled" rectangle to cover the entire canvas
    snakeboard_ctx.fillRect(0, 0, snakeboard.width, snakeboard.height);
    // Draw a "border" around the entire canvas
    snakeboard_ctx.strokeRect(0, 0, snakeboard.width, snakeboard.height);
}

// Draw the snake on the canvas
function drawSnake() {
    // Draw each part
    snake.forEach(drawSnakePart)
}

// Draw one snake part
function drawSnakePart(snakePart) {

    // Set the colour of the snake part
    snakeboard_ctx.fillStyle = snake_col;
    // Set the border colour of the snake part
    snakeboard_ctx.strokestyle = snake_border;
    // Draw a "filled" rectangle to represent the snake part at the coordinates
    // the part is located
    snakeboard_ctx.fillRect(snakePart.x, snakePart.y, snake_block, snake_block);
    // Draw a border around the snake part
    snakeboard_ctx.strokeRect(snakePart.x, snakePart.y, snake_block, snake_block);
}

function move_snake() {
    // Create new head
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    // Add the head
    snake.unshift(head);
    const has_eaten_food = snake[0].x === food_x && snake[0].y === food_y;
    if (has_eaten_food) {
        score += 10;
        document.getElementById("score").innerHTML = score
        gen_food();
    } else {
        snake.pop();
    }
}

function change_direction(event) {
    const LEFT_KEY = 37;
    const RIGHT_KEY = 39;
    const UP_KEY = 38;
    const DOWN_KEY = 40;

    // Prevent the snake from reversing
    if (changing_direction) return;
    changing_direction = true;
    const keyPressed = event.keyCode;
    const goingUp = dy === -snake_block;
    const goingDown = dy === snake_block;
    const goingRight = dx === snake_block;
    const goingLeft = dx === -snake_block;

    if (keyPressed === LEFT_KEY && !goingRight) {
        dx = -snake_block;
        dy = 0;
    }

    if (keyPressed === RIGHT_KEY && !goingLeft) {
        dx = snake_block;
        dy = 0;
    }

    if (keyPressed === UP_KEY && !goingDown) {
        dx = 0;
        dy = -snake_block;
    }

    if (keyPressed === DOWN_KEY && !goingUp) {
        dx = 0;
        dy = snake_block;
    }
}

function has_game_ended() {
    for (let i = 4; i < snake.length; i++) {
        const has_collided = snake[i].x === snake[0].x && snake[i].y === snake[0].y
        if (has_collided) {
            return true
        }
    }
    const hitLeftWall = snake[0].x < 0;
    const hitRightWall = snake[0].x > snakeboard.width - snake_block;
    const hitTopWall = snake[0].y < 0;
    const hitBottomWall = snake[0].y > snakeboard.height - snake_block;

    return hitLeftWall || hitRightWall || hitTopWall || hitBottomWall
}

function random_food(min, max) {
    return Math.round((Math.random() * (max-min) + min) / snake_block) * snake_block;
}

function  gen_food() {
    food_x = random_food(0, snakeboard.width - snake_block);
    food_y = random_food(0, snakeboard.height - snake_block);
    snake.forEach(function has_snake_eaten_food(part) {
        const has_eaten = part.x == food_x && part.y == food_y;
        if (has_eaten) gen_food();
    });
}

function drawFood() {
    snakeboard_ctx.fillStyle = "white";
    snakeboard_ctx.strokestyle = "white";
    snakeboard_ctx.fillRect(food_x, food_y, snake_block, snake_block);
    snakeboard_ctx.strokeRect(food_x, food_y, snake_block, snake_block);
}
