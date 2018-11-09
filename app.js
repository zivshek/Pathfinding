let canvasW = 800;
let canvasH = 600;

let sketch = function(p) {

    let cols = 5;
    let rows = 5;
    let nodeSize = 5;
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
            grid[i] = new Node(p.getRow(i), p.getCol(i));
        }

        start = p.getNode(0, 0);
        end = p.getNode(rows - 1, cols - 1);
        console.log(start);
        openSet.push(start);
    };
    
    p.draw = function() {
        if (openSet.length > 0) {

        } else {

        }

        p.background(255);

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
};

let myp5 = new p5(sketch, window.document.getElementById('container'));