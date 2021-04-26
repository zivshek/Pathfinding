let pathfinding = function (p) {

    let debug = true;
    let canvasW, canvasH, gridw, gridh, marginx, marginy, cellw, cols, rows, totalNodes, grid;

    let openSet = [];
    let closedSet = [];
    let walls = [];
    let path = [];

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

    p.init = function () {
        canvasW = 1200;
        canvasH = 800;
        if (debug) {
            canvasW = 800;
            canvasH = 650;
        }
        gridw = canvasW - 150;
        gridh = canvasH - 150;
        marginx = (canvasW - gridw) / 2;
        marginy = (canvasH - gridh) / 2;
        cellw = 30;
        cols = p.floor(gridw / cellw);
        rows = p.floor(gridh / cellw);
        totalNodes = cols * rows;
        grid = new Array(totalNodes);
    };

    p.setup = function () {
        p.init();
        p.createCanvas(canvasW, canvasH);
        p.frameRate(10);
        for (let i = 0; i < totalNodes; i++) {
            grid[i] = new Node(i, p.getRow(i), p.getCol(i), cellw, marginx, marginy, p);
        }

        start = p.getNode(7, 5);
        end = p.getNode(rows - 8, cols - 6);

        p.reset();

        state = states.CALCULATING;

        startButton = new CustomButton(canvasW / 2, canvasH - 40, 150, 35, "C a l c u l a t e", p);
        clearButton = new CustomButton(marginx + 50, 40, 100, 35, "C l e a r", p);
    };

    p.reset = function () {
        grid.forEach(node => {
            node.reset();
        });

        openSet = [];
        closedSet = [];
        path = [];

        start.g = 0;
        start.h = p.getHeuristic(start, end);
        start.f = start.g + start.h;
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

    p.getNeighbors = function (n) {
        let neighbors = [];
        neighbors.push(p.getNode(n.r - 1, n.c - 1));
        neighbors.push(p.getNode(n.r - 1, n.c));
        neighbors.push(p.getNode(n.r - 1, n.c + 1));
        neighbors.push(p.getNode(n.r, n.c + 1));
        neighbors.push(p.getNode(n.r + 1, n.c + 1));
        neighbors.push(p.getNode(n.r + 1, n.c));
        neighbors.push(p.getNode(n.r + 1, n.c - 1));
        neighbors.push(p.getNode(n.r, n.c - 1));

        neighbors = neighbors.filter(node => node != null && !node.isWall);

        return neighbors;
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
                return;
            }

            p.removeElement(openSet, current);
            closedSet.push(current);
            let neighbors = p.getNeighbors(current);
            for (let i = 0; i < neighbors.length; i++) {
                let neighbor = neighbors[i];
                if (!closedSet.includes(neighbor)) {
                    let g = current.g;
                    if (current.isDiagonal(neighbor)) {
                        g += 1.414;
                    } else {
                        g += 1;
                    }
                    if (openSet.includes(neighbor)) {
                        if (g < neighbor.g) {
                            neighbor.g = g;
                        }
                    }
                    else {
                        neighbor.g = g;
                        openSet.push(neighbor);
                    }
                    neighbor.h = p.getHeuristic(neighbor, end);
                    neighbor.f = neighbor.g + neighbor.h;
                    neighbor.cameFrom = current;
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

        p.push();
        for (let x = 0; x < cols; x++) {
            for (let y = 0; y < rows; y++) {
                p.stroke(0);
                p.strokeWeight(1);
                p.line(x * cellw + marginx, y * cellw + marginy, x * cellw + marginx, (y + 1) * cellw + marginy);
                p.line(x * cellw + marginx, y * cellw + marginy, (x + 1) * cellw + marginx, y * cellw + marginy);
                if (debug) {
                    p.textAlign(p.CENTER);
                    let n = p.getNode(y, x);
                    p.strokeWeight(0.5);
                    p.textSize(8);
                    let fText = n.f === Infinity ? '~' : n.f.toFixed(1);
                    p.text('f: ' + fText, n.x + cellw / 2, n.y + cellw / 3);
                    let gText = n.g === Infinity ? '~' : n.g.toFixed(1);
                    p.text('g:' + gText, n.x + cellw / 2, n.y + 2 * cellw / 3);
                    p.text('h:' + n.h.toFixed(1), n.x + cellw / 2, n.y + cellw);
                }
            }
        }
        p.line(cols * cellw + marginx, marginy, cols * cellw + marginx, rows * cellw + marginy);
        p.line(marginx, rows * cellw + marginy, cols * cellw + marginx, rows * cellw + marginy);
        p.pop();

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
        if (r < 0 || c < 0 || r > rows - 1 || c > cols - 1)
            return null;
        return grid[c + r * cols];
    };

    p.getRow = function (index) {
        return ~~(index / cols);
    };

    p.getCol = function (index) {
        return ~~(index % cols);
    }

    p.getHeuristic = function (from, to) {
        // let dr = Math.abs(from.r - to.r);
        // let dc = Math.abs(from.c - to.c);
        // return 1 * (dr + dc) + (1.414 - 2 * 1) * Math.min(dr, dc);
        return Math.abs(from.r - to.r) + Math.abs(from.c - to.c);
    };

};

let pathfindingp5 = new p5(pathfinding, window.document.getElementById('container'));