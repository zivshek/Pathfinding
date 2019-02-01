let canvasW = 800;
let canvasH = 600;

let pathfinding = function(p) {

    let gridw = 650;
    let gridh = 450;
    let marginx = (canvasW - gridw) / 2;
    let marginy = (canvasH - gridh) / 2;
    
    let cellw = 50;
    let cols = p.floor(gridw / cellw);
    let rows = p.floor(gridh / cellw);

    let totalNodes = cols * rows;
    
    let openSet = [];
    let closedSet = [];
    let walls = [];
    let grid = new Array(totalNodes);
    
    let start;
    let end;
    let found = false;
    let calculate = false;

    let startButton;
    let mx, my;

    p.setup = function() {
        p.createCanvas(canvasW, canvasH);
        for(let i = 0; i < totalNodes; i++) {
            grid[i] = new Node(p.getRow(i), p.getCol(i), cellw, marginx, marginy, p);
        }

        start = p.getNode(0, 0);
        end = p.getNode(rows - 1, cols - 1); 

        p.textAlign(p.CENTER);

        startButton = new CustomButton(canvasW/2, canvasH - 40, 150, 35, "C a l c u l a t e", p);

    };

    p.reset = function() {
        for(let i = 0; i < totalNodes; i++) {
            grid[i].neighbors = [];
            grid[i].addNeighbors(rows, cols);
        }
        openSet = [];
        closedSet = [];

        openSet.push(start);

        calculate = true;
    };
    
    p.AStar = function(start, end) {
        
        if (openSet.length > 0) {
            
            let lowestFIndex = 0;

            for (let i = 0; i < openSet.length; i++) {
                if (openSet[i].f < openSet[lowestFIndex].f)
                    lowestFIndex = i;
            }

            let current = openSet[lowestFIndex];

            if (current === end) {
                found = true;
                calculate = false;
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

                    neighbor.h = p.getHeuristic(neighbor, end);
                    neighbor.f = neighbor.g + neighbor.h;
                }
            }
        }
        else {
            if (!found) {
                console.log("path not found");
                calculate = false;
            }
        }
    };
    
    p.draw = function() {
        
        p.background(255);
        
        //p.AStar(start, end);
        if (calculate)
            p.AStar(start, end);


        for(let i = 0; i < totalNodes; i++) {
            grid[i].draw(255);
        }

        for (let i = 0; i < openSet.length; i++) {
            openSet[i].draw(p.color(255, 255, 0));
        }

        for (let i = 0; i < closedSet.length; i++) {
            closedSet[i].draw(p.color(100, 100, 100));
        }

        for (let i = 0; i < walls.length; i++) {
            walls[i].draw(0);
        }

        start.draw(p.color(0, 255, 0));
        end.draw(p.color(255, 0, 0));

        startButton.draw();
    };

    p.mouseClicked = function() {
        if (p.mouseButton === p.LEFT) {
            mx = p.mouseX - marginx;
            my = p.mouseY - marginy;

            if (!calculate)
                p.mouseHandler();
        }
    };

    p.mouseHandler = function() {
        if (mx > 0 && mx < gridw && my > 0 && my < gridh) {
            let c = ~~(mx / cellw);
            let r = ~~(my / cellw);
            let node = p.getNode(r, c);
            
            node.invalidate();
            // atm, clicking on one node twice won't reset it
            if (!walls.includes(node))
                walls.push(node);
            else
                p.removeElement(walls, node);
        }

        if (startButton.clicked(mx + marginx, my + marginy)) {
            p.reset();
        }
    };

    p.removeElement = function (array, element) {
        for (let i = array.length - 1; i >= 0; i--) {
            if (array[i] === element) {
                array.splice(i, 1);
            }
        }
    }

    p.getNode = function(r, c) {
        return grid[c + r * cols];
    };

    p.getRow = function(index) {
        return ~~(index / cols);
    };

    p.getCol = function(index) {
        return ~~(index % cols);
    }

    p.getHeuristic = function(from, to) {
        return Math.abs(from.r - to.r) + Math.abs(from.c - to.c);
    };

};

let pathfindingp5 = new p5(pathfinding, window.document.getElementById('container'));