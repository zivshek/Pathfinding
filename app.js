let pathfinding = function (p) {

    let canvasW, canvasH, gridw, gridh, marginx, marginy, cellw, cols, rows, totalNodes, grid;

    let openSet = [];
    let closedSet = [];
    let walls = [];
    let path = [];

    let start;
    let end;
    let found;

    let startButton, stepButton, clearButton, diagonalCheckbox, debugCheckbox;

    let cmds = [];
    let MAX_CMDS = 10;
    let keys = {
        ctrl: false,
        z: false
    };
    let speed = 20;

    let state = State.NONE;

    // only called once
    p.init = function () {
        canvasW = 1200;
        canvasH = 800;
        gridw = canvasW - 150;
        gridh = canvasH - 150;
        marginx = (canvasW - gridw) / 2;
        marginy = (canvasH - gridh) / 2;
        p.createCanvas(canvasW, canvasH);

        {
            let x = canvasW / 2;
            const y = canvasH - 40;
            const w = 100;
            const h = 35;
            startButton = new CustomButton(x, y, w, h, 'S t a r t', p);
            x += 2 * w;
            stepButton = new CustomButton(x, y, w, h, 'S t e p', p, false);
        }

        clearButton = new CustomButton(marginx + 50, 40, 100, 35, 'C l e a r', p);
        diagonalCheckbox = p.createCheckbox('allow diagonal', true);
        debugCheckbox = p.createCheckbox('debug', false);
        debugCheckbox.changed(p.onDebugCheckboxChanged);
    };

    p.setup = function () {
        p.init();
        p.onDebugCheckboxChanged();

        state = State.CALCULATING;
    };

    p.reset = function () {
        p.frameRate(speed);

        if (p.debug()) {
            start = p.getNode(1, 1);
            end = p.getNode(rows - 1, cols - 1);
        } else {
            start = p.getNode(7, 5);
            end = p.getNode(rows - 8, cols - 6);
        }

        grid.forEach(node => node.reset());

        openSet = [];
        closedSet = [];
        path = [];

        start.g = 0;
        start.h = p.getHeuristic(start, end);
        start.f = start.g + start.h;
        openSet.push(start);
        state = State.NONE;

        p.updateBtns();
    };

    p.updateBtns = function() {
        if (state === State.NONE) {
            startButton.setText('S t a r t');
            stepButton.setVisible(false);
        }
        else if (state === State.CALCULATING) {
            startButton.setText('P a u s e');
            stepButton.setVisible(false);
        }
        else if (state === State.PAUSED) {
            startButton.setText('Resume');
            stepButton.setVisible(true);
        }
    };

    p.onDebugCheckboxChanged = function () {
        cellw = p.debug() ? 90 : 30;
        speed = p.debug() ? 5 : 20;
        cols = p.floor(gridw / cellw);
        rows = p.floor(gridh / cellw);
        totalNodes = cols * rows;
        grid = new Array(totalNodes);
        for (let i = 0; i < totalNodes; i++) {
            grid[i] = new Node(i, p.getRow(i), p.getCol(i), cellw, marginx, marginy, p);
        }
        walls = [];
        p.reset();
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
        // Must from top left and be clockwise, according to Neighbor order
        for (let i = 0; i < NeighborType.Total; i++) {
            let neighbor = p.getNodeByNeighborType(n, i);
            if (!p.isBlocked(n, neighbor, i))
                neighbors.push(neighbor);
        }

        return neighbors;
    };

    p.isBlocked = function (n, neighbor, neighborType) {
        let blocked = p.isWallOrNull(neighbor);

        if (!p.allowDiagonal())
            return blocked;

        switch (neighborType) {
            case NeighborType.TopLeft:
                return blocked || (p.isWallOrNull(p.getNode(n.r, n.c - 1)) && p.isWallOrNull(p.getNode(n.r - 1, n.c)));
            case NeighborType.TopRight:
                return blocked || (p.isWallOrNull(p.getNode(n.r, n.c + 1)) && p.isWallOrNull(p.getNode(n.r - 1, n.c)));
            case NeighborType.BottomRight:
                return blocked || (p.isWallOrNull(p.getNode(n.r, n.c + 1)) && p.isWallOrNull(p.getNode(n.r + 1, n.c)));
            case NeighborType.BottomRight:
                return blocked || (p.isWallOrNull(p.getNode(n.r, n.c - 1)) && p.isWallOrNull(p.getNode(n.r + 1, n.c)));
            default:
                return blocked;
        }
    };

    p.isWallOrNull = function (n) {
        return n == null || n.isWall;
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
                state = State.NONE;
                p.updateBtns();
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
                            neighbor.cameFrom = current;
                        }
                    }
                    else {
                        neighbor.g = g;
                        openSet.push(neighbor);
                        neighbor.cameFrom = current;
                    }
                    neighbor.h = p.getHeuristic(neighbor, end);
                    neighbor.f = neighbor.g + neighbor.h;
                }
            }
        }
        else {
            if (!found) {
                console.log("path not found");
                state = State.NONE;
                p.updateBtns();
            }
        }
    };

    p.draw = function () {
        p.clear();
        p.background(255);

        //p.AStar(start, end);
        if (state == State.CALCULATING)
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
                if (p.debug()) {
                    p.textAlign(p.CENTER);
                    let n = p.getNode(y, x);
                    if (n.isWall) {
                        p.fill(255);
                    } else {
                        p.fill(0);
                    }
                    p.strokeWeight(0.5);
                    p.textSize(12);
                    let xPos = n.x + cellw / 2;
                    let getYPos = (line) => {
                        return n.y - 5 + line * cellw / 5;
                    };
                    let line = 1;
                    p.text('index: ' + n.id, xPos, getYPos(line++));
                    p.text('from: ' + n.cameFrom?.id, xPos, getYPos(line++));
                    let fText = n.f === Infinity ? '~' : n.f.toFixed(1);
                    p.text('f: ' + fText, xPos, getYPos(line++));
                    let gText = n.g === Infinity ? '~' : n.g.toFixed(1);
                    p.text('g:' + gText, xPos, getYPos(line++));
                    p.text('h:' + n.h.toFixed(1), xPos, getYPos(line++));
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
        stepButton.draw('rgb(185, 229, 123)');
        clearButton.draw(p.color(200, 30, 30, 150));
    };

    p.isCalculating = function () {
        return state === State.CALCULATING || state === State.PAUSED;
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
        return { x: p.mouseX - marginx, y: p.mouseY - marginy };
    };

    p.mousePressed = function () {
        if (p.mouseButton != p.LEFT || p.isCalculating())
            return;

        const { x, y } = p.getMousePos();

        let n = p.getNodeMouseIsOn(x, y);
        if (p.isValidNode(n)) {
            state = n.getIsWall() ? State.ERASING_WALL_SINGLE : State.PAINTING_WALL_SINGLE;
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
            case State.PAINTING_WALL_SINGLE:
                state = State.PAINTING_WALL_MULTIPLE;
                cmds.push(new Cmd(state, [n], p));
                p.setWall(n, true);
                break;
            case State.ERASING_WALL_SINGLE:
                state = State.ERASING_WALL_MULTIPLE;
                cmds.push(new Cmd(state, [n], p));
                p.setWall(n, false);
                break;
            case State.PAINTING_WALL_MULTIPLE:
                if (!n.getIsWall()) {
                    let cmd = p.getLastCmd();
                    cmd.addNode(n);
                    p.setWall(n, true);
                }
                break;
            case State.ERASING_WALL_MULTIPLE:
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

        if (state === State.PAINTING_WALL_SINGLE) {
            cmds.push(new Cmd(state, [n], p));
            p.setWall(n, true);
        } else if (state === State.ERASING_WALL_SINGLE) {
            cmds.push(new Cmd(state, [n], p));
            p.setWall(n, false);
        }
    };

    p.getNodeMouseIsOn = function (x, y) {
        if (x > 0 && x < gridw && y > 0 && y < gridh) {
            let c = ~~(x / cellw);
            let r = ~~(y / cellw);
            return p.getNode(r, c);
        }
        return null;
    };

    p.mouseHandler = function () {
        if (p.btnClicked(startButton)) {
            switch (state) {
                case State.CALCULATING:
                    state = State.PAUSED;
                    break;
                case State.PAUSED:
                    state = State.CALCULATING;
                    break;
                default:
                    p.reset();
                    state = State.CALCULATING;
                    break;
            }
            p.updateBtns();
        }

        if (p.btnClicked(clearButton)) {
            p.reset();
            for (let i = 0; i < walls.length; i++) {
                walls[i].setIsWall(false);
            }
            walls = [];
        }

        if (stepButton.visible && p.btnClicked(stepButton)) {
            p.AStar(start, end);
        }
    };

    p.btnClicked = function(btn) {
        return btn.clicked(p.mouseX, p.mouseY);
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

    p.allowDiagonal = function () {
        return diagonalCheckbox.checked();
    };

    p.debug = function() {
        return debugCheckbox.checked();
    };

    p.getNodeByNeighborType = function (n, neighborType) {
        if (n == null)
            return null;

        switch (neighborType)
        {
            case NeighborType.TopLeft:
                return p.allowDiagonal() ? p.getNode(n.r - 1, n.c - 1) : null;
            case NeighborType.Top:
                return p.getNode(n.r - 1, n.c);
            case NeighborType.TopRight:
                return p.allowDiagonal() ? p.getNode(n.r - 1, n.c + 1) : null;
            case NeighborType.Right:
                return p.getNode(n.r, n.c + 1);
            case NeighborType.BottomRight:
                return p.allowDiagonal() ? p.getNode(n.r + 1, n.c + 1) : null;
            case NeighborType.Bottom:
                return p.getNode(n.r + 1, n.c);
            case NeighborType.BottomLeft:
                return p.allowDiagonal() ? p.getNode(n.r + 1, n.c - 1) : null;
            case NeighborType.Left:
                return p.getNode(n.r, n.c - 1);
        }
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