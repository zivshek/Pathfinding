let canvasW = 800;
let canvasH = 600;

let pathfinding = function(p) {

    let cols = 15;
    let rows = 11;
    let nodeSize = 50;
    let totalNodes = cols * rows;
    
    let openSet = [];
    let closedSet = [];
    let grid = new Array(totalNodes);
    
    let start;
    let end;
    let found = false;

    p.getGrid = function() {
        return grid;
    }

    p.getClosedSet = function() {
        return closedSet;
    }

    p.setup = function() {
        p.createCanvas(canvasW, canvasH);
        for(let i = 0; i < totalNodes; i++) {
            grid[i] = new Node(p.getRow(i), p.getCol(i), nodeSize, p);
        }

        for(let i = 0; i < totalNodes; i++) {
            grid[i].addNeighbors(rows, cols);
        }

        start = p.getNode(0, 0);
        end = p.getNode(rows - 1, cols - 1);

        openSet.push(start);

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
            }

            // remove from openset
            for (let i = openSet.length - 1; i >= 0; i--) {
                if (openSet[i] === current) {
                    openSet.splice(i, 1);
                }
            }

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
    };
    
    p.draw = function() {
        
        p.background(255);
        
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

        start.draw(p.color(0, 255, 0));
        end.draw(p.color(255, 0, 0));
    };

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