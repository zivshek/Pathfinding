let canvasW = 800;
let canvasH = 600;

let sketch = function(p) {

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

    p.setup = function() {
        p.createCanvas(canvasW, canvasH);
        for(let i = 0; i < totalNodes; i++) {
            grid[i] = new Node(p.getRow(i), p.getCol(i), nodeSize, p);
        }

        start = p.getNode(0, 0);
        end = p.getNode(rows - 1, cols - 1);

    };
    
    p.AStar = function(start, end) {
        openSet.push(start);
        
        while (!openSet.empty()) {
            //let current = 
        }
    };
    
    p.draw = function() {
        
        p.background(255);
        
        if (openSet.length > 0) {

        } else {

        }

        for(let i = 0; i < totalNodes; i++) {
            grid[i].draw();
        }

    };

    p.getNode = function(r, c) {
        return grid[c + r * cols];
    };

    p.getRow = function(index) {
        return ~~(index / cols);
    };

    p.getCol = function(index) {
        return ~~(index % cols);
    };

    p.getHeuristic = function(from, to) {
        return Math.abs(from.r - to.r) + Math.abs(from.c - to.c);
    };
};

let myp5 = new p5(sketch, window.document.getElementById('container'));