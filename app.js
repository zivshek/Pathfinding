let pathfinding = function (p) {

    let canvasW = 1200;
    let canvasH = 800;
    // let canvasW = 800;
    // let canvasH = 650;
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

    let cmds = [];
    let MAX_CMDS = 10;
    let keys = {
        ctrl: false,
        z: false
    };

    const states = {
        NONE: 0,
        PAINTING_WALL_SINGLE: 1,
        PAINTING_WALL_MULTIPLE: 2,
        ERASING_WALL_SINGLE: 3,
        ERASING_WALL_MULTIPLE: 4,
        CALCULATING: 5
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

    p.keyPressed = function () {
        if (p.isCalculating())
            return;

        if (p.keyCode === 17)
            keys.ctrl = true;
        if (p.keyCode === 90)
            keys.z = true;

        if (keys.ctrl && keys.z) {
            if (cmds.length > 0) {
                let cmd = p.getLastCmd();
                cmd.undo();
                p.removeElement(cmds, cmd);
            }
        }
    };

    p.keyReleased = function () {
        if (p.isCalculating())
            return;
        if (p.keyCode === 17)
            keys.ctrl = false;
        if (p.keyCode === 90)
            keys.z = false;
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
        clearButton.draw(p.color(200, 30, 30, 150));
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
        if (p.mouseButton != p.LEFT || p.isCalculating())
            return;

        const { x, y } = p.getMousePos();

        let n = p.getNodeMouseIsOn(x, y);
        if (p.isValidNode(n)) {
            if (n.getIsWall())
                state = states.ERASING_WALL_SINGLE;
            else
                state = states.PAINTING_WALL_SINGLE;
        }
    };

    p.mouseReleased = function () {
        p.handleNodeClick();
        p.mouseHandler();
    };

    p.mouseDragged = function () {
        if (p.mouseButton != p.LEFT || p.isCalculating())
            return;

        const { x, y } = p.getMousePos();
        let n = p.getNodeMouseIsOn(x, y);
        if (!p.isValidNode(n))
            return;

        switch (state) {
            case states.PAINTING_WALL_SINGLE:
                state = states.PAINTING_WALL_MULTIPLE;
                cmds.push(new Cmd(state, [n], p));
                p.setWall(n, true);
                break;
            case states.ERASING_WALL_SINGLE:
                state = states.ERASING_WALL_MULTIPLE;
                cmds.push(new Cmd(state, [n], p));
                p.setWall(n, false);
                break;
            case states.PAINTING_WALL_MULTIPLE:
                if (!n.getIsWall()) {
                    let cmd = p.getLastCmd();
                    cmd.addNode(n);
                    p.setWall(n, true);
                }
                break;
            case states.ERASING_WALL_MULTIPLE:
                if (n.getIsWall()) {
                    let cmd = p.getLastCmd();
                    cmd.addNode(n);
                    p.setWall(n, false);
                }
                break;
        }
    };

    p.getLastCmd = function () {
        return cmds[cmds.length - 1];
    };

    p.handleNodeClick = function () {
        if (p.mouseButton != p.LEFT || p.isCalculating())
            return;

        const { x, y } = p.getMousePos();
        let n = p.getNodeMouseIsOn(x, y);
        if (!p.isValidNode(n))
            return;

        if (state === states.PAINTING_WALL_SINGLE) {
            cmds.push(new Cmd(state, [n], p));
            p.setWall(n, true);
        } else if (state === states.ERASING_WALL_SINGLE) {
            cmds.push(new Cmd(state, [n], p));
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