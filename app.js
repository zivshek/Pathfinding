let pathfinding = function (p) {

    let canvasW = 1200;
    let canvasH = 800;
    let gridw = canvasW - 150;
    let gridh = canvasH - 150;
    let marginx = (canvasW - gridw) / 2;
    let marginy = (canvasH - gridh) / 2;

    let cellw = 30;
    let cols = p.floor(gridw / cellw);
    let rows = p.floor(gridh / cellw);

    let totalNodes = cols * rows;

    let openSet = [];
    let closedSet = [];
    let walls = [];
    let path = [];

    let grid = new Array(totalNodes);

    let start;
    let end;
    let found;

    let startButton, clearButton;
    let mx, my;

    const states = {
        NONE: 0,
        PAINTING_WALL: 1,
        ERASING_WALL: 2,
        CALCULATING: 3
    };

    let state = states.NONE;

    p.setup = function () {
        p.createCanvas(canvasW, canvasH);
        for (let i = 0; i < totalNodes; i++) {
            grid[i] = new Node(p.getRow(i), p.getCol(i), cellw, marginx, marginy, p);
        }

        start = p.getNode(7, 5);
        end = p.getNode(rows - 8, cols - 6);

        p.reset();

        state = states.CALCULATING;

        p.textAlign(p.CENTER);

        startButton = new CustomButton(canvasW / 2, canvasH - 40, 150, 35, "C a l c u l a t e", p);
        clearButton = new CustomButton(marginx + 50, 40, 100, 35, "C l e a r", p);
    };

    p.reset = function () {
        for (let i = 0; i < totalNodes; i++) {
            grid[i].neighbors = [];
            grid[i].addNeighbors(rows, cols);
        }
        openSet = [];
        closedSet = [];
        path = [];

        start.g = 0;
        start.f = p.getHeuristic(start, end);
        openSet.push(start);
        state = states.NONE;
    };

    p.AStar = function (start, end) {
        found = false;
        if (openSet.length > 0) {

            let lowestFIndex = 0;

            for (let i = 0; i < openSet.length; i++) {
                if (openSet[i].f < openSet[lowestFIndex].f)
                    lowestFIndex = i;
            }

            let current = openSet[lowestFIndex];

            if (current === end) {
                found = true;
                while (current.cameFrom != undefined) {
                    path.push(current);
                    current = current.cameFrom;
                }
                path.push(start);
                state = states.NONE;
            }

            // remove from openset
            p.removeElement(openSet, current);

            closedSet.push(current);
            for (let i = 0; i < current.neighbors.length; i++) {
                let neighbor = current.neighbors[i];

                if (!closedSet.includes(neighbor)) {
                    let tempG = current.g + 1;

                    if (openSet.includes(neighbor)) {
                        if (tempG < neighbor.g) {
                            neighbor.g = tempG;
                        }
                    }
                    else {
                        neighbor.g = tempG;
                        openSet.push(neighbor);
                    }

                    neighbor.cameFrom = current;
                    neighbor.h = p.getHeuristic(neighbor, end);
                    neighbor.f = neighbor.g + neighbor.h;
                }
            }
        }
        else {
            if (!found) {
                console.log("path not found");
                state = states.NONE;
            }
        }
    };

    p.draw = function () {
        p.clear();
        p.background(255);

        //p.AStar(start, end);
        if (state == states.CALCULATING)
            p.AStar(start, end);

        for (let i = 0; i < totalNodes; i++) {
            grid[i].draw(255);
        }

        p.push();
        for (let x = 0; x < cols; x++) {
            for (let y = 0; y < rows; y++) {
                p.stroke(0);
                p.strokeWeight(1);
                p.line(x * cellw + marginx, y * cellw + marginy, x * cellw + marginx, (y + 1) * cellw + marginy);
                p.line(x * cellw + marginx, y * cellw + marginy, (x + 1) * cellw + marginx, y * cellw + marginy);
            }
        }
        p.line(cols * cellw + marginx, marginy, cols * cellw + marginx, rows * cellw + marginy);
        p.line(marginx, rows * cellw + marginy, cols * cellw + marginx, rows * cellw + marginy);
        p.pop();

        for (let i = 0; i < openSet.length; i++) {
            openSet[i].draw(p.color(175, 255, 175));
        }

        for (let i = 0; i < closedSet.length; i++) {
            closedSet[i].draw(p.color(100, 100, 100));
        }

        for (let i = 0; i < walls.length; i++) {
            walls[i].draw(0);
        }

        start.draw(p.color(0, 255, 0));
        end.draw(p.color(255, 0, 0));

        if (path.length > 1) {
            for (let i = 1; i < path.length; i++) {
                p.stroke(p.color(255, 255, 0));
                p.line(path[i].x + cellw / 2, path[i].y + cellw / 2,
                    path[i - 1].x + cellw / 2, path[i - 1].y + cellw / 2);
            }
        }

        startButton.draw('rgb(185, 229, 123)');
        clearButton.draw('rgb(200, 30, 30)');
    };

    p.isCalculating = function () {
        return state === states.CALCULATING;
    };

    p.isValidNode = function (node) {
        return node != null && node != start && node != end;
    };

    p.setWall = function (node, isWall) {
        node.setIsWall(isWall);
        if (isWall && !walls.includes(node))
            walls.push(node);
        if (!isWall)
            p.removeElement(walls, node);
    };

    p.getMousePos = function () {
        mx = p.mouseX - marginx;
        my = p.mouseY - marginy;
        return { x: mx, y: my };
    };

    p.mousePressed = function () {
        console.log(p.isCalculating())
        if (p.mouseButton != p.LEFT || p.isCalculating())
            return;

        const { x, y } = p.getMousePos();

        let n = p.getNodeMouseIsOn(x, y);
        if (p.isValidNode(n)) {
            if (walls.includes(n))
                state = states.ERASING_WALL;
            else
                state = states.PAINTING_WALL;
        }
    };

    p.mouseReleased = function () {
        p.handleNodeClick();
        p.mouseHandler();
    };

    p.mouseDragged = function () {
        p.handleNodeClick();
    }

    p.handleNodeClick = function () {
        if (p.mouseButton != p.LEFT || p.isCalculating())
            return;

        const { x, y } = p.getMousePos();
        let n = p.getNodeMouseIsOn(x, y);
        if (!p.isValidNode(n))
            return;

        if (state === states.PAINTING_WALL) {
            p.setWall(n, true);
        } else if (state === states.ERASING_WALL) {
            p.setWall(n, false);
        }
    };

    p.getNodeMouseIsOn = function (x, y) {
        if (mx > 0 && mx < gridw && my > 0 && my < gridh) {
            let c = ~~(mx / cellw);
            let r = ~~(my / cellw);
            return p.getNode(r, c);
        }
        return null;
    };

    p.mouseHandler = function () {
        if (startButton.clicked(mx + marginx, my + marginy)) {
            p.reset();
            state = states.CALCULATING;
        }

        if (clearButton.clicked(mx + marginx, my + marginy)) {
            p.reset();
            for (let i = 0; i < walls.length; i++) {
                walls[i].setIsWall(false);
            }
            walls = [];
        }
    };

    p.removeElement = function (array, element) {
        for (let i = array.length - 1; i >= 0; i--) {
            if (array[i] === element) {
                array.splice(i, 1);
            }
        }
    }

    p.getNode = function (r, c) {
        return grid[c + r * cols];
    };

    p.getRow = function (index) {
        return ~~(index / cols);
    };

    p.getCol = function (index) {
        return ~~(index % cols);
    }

    p.getHeuristic = function (from, to) {
        return Math.abs(from.r - to.r) + Math.abs(from.c - to.c);
    };

};

let pathfindingp5 = new p5(pathfinding, window.document.getElementById('container'));