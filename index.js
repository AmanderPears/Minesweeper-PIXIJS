window.addEventListener('load', main, false);

//8x8=10
//16x16=40
//24x24=99

let gameWidth = 499;
let gameHeight = 499;
let gameCol = 16;
let gameRow = gameCol;
let gameMineCount = 40;
let gameCellList = [];
let gameStage;
let gameLastClick = 0;

function main() {
    let type = "WebGL"
    if (!PIXI.utils.isWebGLSupported()) {
        type = "canvas"
    }

    PIXI.utils.sayHello(type)


    //get div to place game
    let parentDiv = document.getElementById("game")

    //create pixi canvas
    let app = new PIXI.Application({ width: gameWidth, height: gameHeight });

    //Add the canvas that Pixi automatically created for you to the HTML document
    parentDiv.appendChild(app.view);
    parentDiv.oncontextmenu = e => {
        e.preventDefault();
        e.stopPropagation();
    };
    setup(app);
};

//makes a cell based on the canvas
function cell(i, x, y, w, h, isMine) {

    let rectangle = new PIXI.Graphics();
    //linstyle, width, color, ?
    rectangle.lineStyle(1, 0x000000, 1);
    rectangle.beginFill(0x8ebabe);
    // if (isMine)
    //     rectangle.beginFill(0x8e00be);
    rectangle.drawRect(0, 0, w, h);
    rectangle.endFill();

    rectangle.x = x;
    rectangle.y = y;

    rectangle.interactive = true;
    rectangle.customIndex = i; //custom property to track index
    rectangle.customIsMine = isMine; // flag to determine if mine
    rectangle.customIsShown = false;
    rectangle.on('click', e => {
        //try to simulate double click
        let now = new Date();
        now = now.getTime();

        if (now - gameLastClick < 500) {
            // console.log("double");
            cellClicked(rectangle, true);
        } else {
            // console.log("single");
            cellClicked(rectangle);
        }

        gameLastClick = now;
    });
    rectangle.on('rightclick', e => cellRightClicked(rectangle));

    return rectangle;
}

function cellClicked(cell, double = false) {
    // if (!cell.customIsShown && !cell.customIsFlagged) {
    if (!cell.customIsFlagged) {
        //cell.interactive = false;
        if (cell.customIsMine)
            gameOver(cell);
        else
            revealCell(cell, double);
    }

    gameWon();
}

function cellRightClicked(cell) {
    if (!cell.customIsShown)
        displayCellFlag(cell);
}

//make and arrange cells
function setup(app) {

    gameStage = app;

    let cellCollection = [];

    let x = 0;
    let y = 0;

    let gw = app.renderer.width;
    let gh = app.renderer.height;

    let w = (gameWidth / gameCol);
    let h = (gameHeight / gameRow);

    //set of rnd index with mines
    let mineIndexSet = generateIndexSet(gameMineCount);

    for (i = 0; i < (gameCol * gameRow); i++) {
        //calculate placement coordinates
        //calc x
        x = (i % gameCol) * w;

        //cal y
        if (i != 0 && i % gameCol == 0)
            y = y + h;
        // y = y * h;

        let c = cell(i, x, y, w, h, mineIndexSet.has(i));
        cellCollection.push(c);
        app.stage.addChild(c);
    }

    gameCellList = cellCollection;
}

//generate x indexs that contain mines
function generateIndexSet(num) {
    const set = new Set();

    let max = gameCol * gameRow;

    while (set.size < num) {
        set.add(getRandomInt(0, max));
    }

    return set;
}

//get rnd num equal to or greater than min
//and less than max
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

//game is not over when we enter this function
function getBombCount(cell) {
    let bombCount = 0;

    const i = cell.customIndex

    let lookTop = i >= 16;
    let lookBottom = i <= 239;
    let lookRight = (i % 16) < 15;
    let lookLeft = (i % 16) > 0;

    //top middle
    if (lookTop && gameCellList[i - 16].customIsMine)
        bombCount++;

    //bottom middle
    if (lookBottom && gameCellList[i + 16].customIsMine)
        bombCount++;

    if (lookRight) {
        //top right
        if (lookTop && gameCellList[i - 16 + 1].customIsMine)
            bombCount++;
        //middle right
        if (gameCellList[i + 1].customIsMine)
            bombCount++;
        //bottom right
        if (lookBottom && gameCellList[i + 16 + 1].customIsMine)
            bombCount++;
    }

    if (lookLeft) {
        //top left
        if (lookTop && gameCellList[i - 16 - 1].customIsMine)
            bombCount++;
        //middle left
        if (gameCellList[i - 1].customIsMine)
            bombCount++;
        //bottom left
        if (lookBottom && gameCellList[i + 16 - 1].customIsMine)
            bombCount++;
    }

    return bombCount;
}

//game is not over when we enter this function
function getFlagCount(cell) {
    let flagCount = 0;

    const i = cell.customIndex

    let lookTop = i >= 16;
    let lookBottom = i <= 239;
    let lookRight = (i % 16) < 15;
    let lookLeft = (i % 16) > 0;

    //top middle
    if (lookTop && gameCellList[i - 16].customIsFlagged)
        flagCount++;

    //bottom middle
    if (lookBottom && gameCellList[i + 16].customIsFlagged)
        flagCount++;

    if (lookRight) {
        //top right
        if (lookTop && gameCellList[i - 16 + 1].customIsFlagged)
            flagCount++;
        //middle right
        if (gameCellList[i + 1].customIsFlagged)
            flagCount++;
        //bottom right
        if (lookBottom && gameCellList[i + 16 + 1].customIsFlagged)
            flagCount++;
    }

    if (lookLeft) {
        //top left
        if (lookTop && gameCellList[i - 16 - 1].customIsFlagged)
            flagCount++;
        //middle left
        if (gameCellList[i - 1].customIsFlagged)
            flagCount++;
        //bottom left
        if (lookBottom && gameCellList[i + 16 - 1].customIsFlagged)
            flagCount++;
    }

    return flagCount;
}

function displayBombCount(cell) {

    if (cell.customIsShown || cell.customIsMine || cell.customIsFlagged)
        return;

    //cell.interactive = false;
    cell.customIsShown = true;

    //change cell look
    cell.lineStyle(1, 0x000000, 1);
    cell.beginFill(0x48b9a8);
    cell.drawRect(0, 0, cell.width, cell.height);
    cell.endFill();

    let bc = getBombCount(cell);
    if (bc > 0) {
        //create text graphic, set position and add to cell
        let digit = new PIXI.Text(bc);
        let dx = cell.width / 2 - digit.width / 2;
        let dy = cell.height / 2 - digit.height / 2;
        digit.position.set(dx, dy);

        cell.addChild(digit);
    }

    cell.customValue = bc;
}

function displayMine(cell) {
    cell.customIsShown = true;

    //change cell look
    cell.lineStyle(1, 0x000000, 1);
    cell.beginFill(0xfa3c5d);
    cell.drawRect(0, 0, cell.width, cell.height);
    cell.endFill();
}

function displayCellFlag(cell) {

    if (cell.customIsFlagged) {
        cell.customIsFlagged = false;
        cell.removeChildren();
    } else {
        cell.customIsFlagged = true;

        let style = new PIXI.TextStyle({
            fontFamily: "Arial",
            fill: "red",
            stroke: '#FF0000',
            strokeThickness: 4,
            dropShadow: true,
            dropShadowColor: "#000000",
            dropShadowBlur: 4,
            dropShadowAngle: Math.PI / 6,
            dropShadowDistance: 6,
        });

        //create text graphic, set position and add to cell
        let digit = new PIXI.Text('F', style);
        let dx = cell.width / 2 - digit.width / 2;
        let dy = cell.height / 2 - digit.height / 2;
        digit.position.set(dx, dy);

        cell.addChild(digit);
    }
}

function revealCell(cell, auto = false) {

    if (getBombCount(cell) == 0) {
        floodFill(cell);
    } else if (auto) {
        autoClick(cell);
    } else {
        //change display
        displayBombCount(cell);
    }

}

function floodFill(cell) {
    if (getBombCount(cell) > 0) {
        displayBombCount(cell);
        return;
    } else if (cell.customIsShown)
        return;
    else if (cell.customIsMine)
        return;
    else
        displayBombCount(cell);

    const i = cell.customIndex

    let lookTop = ((i - 16) / 16) > 0;
    let lookBottom = ((i + 16) / 16) < 16;
    let lookRight = (i % 16) < 15;
    let lookLeft = (i % 16) > 0;
    next = "";

    //down
    if (lookBottom)
        floodFill(gameCellList[cell.customIndex + 16]);

    //up
    if (lookTop)
        floodFill(gameCellList[cell.customIndex - 16]);

    //left
    if (lookLeft)
        floodFill(gameCellList[cell.customIndex - 1]);

    //righ
    if (lookRight)
        floodFill(gameCellList[cell.customIndex + 1]);

    //top right
    if (lookTop && lookRight)
        floodFill(gameCellList[cell.customIndex - 16 + 1]);

    //bottom right
    if (lookBottom && lookRight)
        floodFill(gameCellList[cell.customIndex + 16 + 1]);

    //top left
    if (lookTop && lookLeft)
        floodFill(gameCellList[cell.customIndex - 16 - 1]);

    //bottom left
    if (lookBottom && lookLeft)
        floodFill(gameCellList[cell.customIndex + 16 - 1]);

    return;
}

function autoClick(cell) {

    if (getFlagCount(cell) !== cell.customValue)
        return;

    const i = cell.customIndex

    let lookTop = ((i - 16) / 16) > 0;
    let lookBottom = ((i + 16) / 16) < 16;
    let lookRight = (i % 16) < 15;
    let lookLeft = (i % 16) > 0;

    //self
    displayBombCount(cell);

    //down
    if (lookBottom)
        displayBombCount(gameCellList[cell.customIndex + 16]);

    //up
    if (lookTop)
        displayBombCount(gameCellList[cell.customIndex - 16]);

    //left
    if (lookLeft)
        displayBombCount(gameCellList[cell.customIndex - 1]);

    //righ
    if (lookRight)
        displayBombCount(gameCellList[cell.customIndex + 1]);

    //top right
    if (lookTop && lookRight)
        displayBombCount(gameCellList[cell.customIndex - 16 + 1]);

    //bottom right
    if (lookBottom && lookRight)
        displayBombCount(gameCellList[cell.customIndex + 16 + 1]);

    //top left
    if (lookTop && lookLeft)
        displayBombCount(gameCellList[cell.customIndex - 16 - 1]);

    //bottom left
    if (lookBottom && lookLeft)
        displayBombCount(gameCellList[cell.customIndex + 16 - 1]);

}

function gameOver() {
    gameCellList.forEach((c, i, a) => {
        c.interactive = false;
        if (c.customIsMine) {
            displayMine(c);
        }
    });
    //gameStage.stop();



    let style = new PIXI.TextStyle({
        fontFamily: "Arial",
        fill: "white",
        fontSize: 50,
        stroke: '#000000',
        strokeThickness: 4,
        dropShadow: true,
        dropShadowColor: "#000000",
        dropShadowBlur: 4,
        dropShadowAngle: Math.PI / 6,
        dropShadowDistance: 6,
    });

    //create text graphic, set position and add to cell
    let digit = new PIXI.Text('GAME OVER!!', style);
    let dx = gameWidth / 2 - digit.width / 2;
    let dy = gameHeight / 2 - digit.height / 2;
    digit.position.set(dx, dy);

    gameStage.stage.addChild(digit);
}

function gameWon() {
    let shown = gameCellList.filter(c => {
        return c.customIsShown && !c.customIsMine;
    })

    if (shown.length === (gameCol * gameRow - gameMineCount)) {

        let style = new PIXI.TextStyle({
            fontFamily: "Arial",
            fill: "white",
            fontSize: 50,
            stroke: '#000000',
            strokeThickness: 4,
            dropShadow: true,
            dropShadowColor: "#000000",
            dropShadowBlur: 4,
            dropShadowAngle: Math.PI / 6,
            dropShadowDistance: 6,
        });

        //create text graphic, set position and add to cell
        let digit = new PIXI.Text('VICTORY!!', style);
        let dx = gameWidth / 2 - digit.width / 2;
        let dy = gameHeight / 2 - digit.height / 2;
        digit.position.set(dx, dy);

        gameStage.stage.addChild(digit);
        //gameStage.stop();
    }
}