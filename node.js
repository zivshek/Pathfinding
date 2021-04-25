class Node {
    constructor(id, r, c, size, marginx, marginy, p5) {
        this.id = id;
        this.f = 0;
        this.g = Infinity;
        this.h = 0;
        this.isWall = false;

        this.r = r;
        this.c = c;
        this.size = size;
        this.x = this.c * this.size + marginx;
        this.y = this.r * this.size + marginy;
        this.p5 = p5;
        this.cameFrom = undefined;
    }

    draw(color) {
        this.p5.push();
        this.p5.rectMode(this.p5.CORNER);
        this.p5.stroke(0, 0, 0, 0);
        this.p5.fill(color);
        this.p5.rect(this.x + 0.5, this.y + 0.5, this.size - 1, this.size - 1);
        // this.p5.textAlign(this.p5.CENTER);
        // this.p5.text(this.id, this.x, this.y);
        this.p5.pop();
    }

    getIsWall() {
        return this.isWall;
    }

    setIsWall(isWall) {
        this.isWall = isWall;
    }

    getNeighbors() {
        let neighbors = [];
        let addNeighbor = function (node) {
            if (node != null && !node.isWall) {
                neighbors.push(node);
            }
        }

        let west = this.p5.getNode(this.r, this.c - 1);
        let north = this.p5.getNode(this.r - 1, this.c);
        let east = this.p5.getNode(this.r, this.c + 1);
        let south = this.p5.getNode(this.r + 1, this.c);

        addNeighbor(west);
        addNeighbor(north);
        addNeighbor(east);
        addNeighbor(south);

        let canAddDiagonal = function (n1, n2) {
            return (n1 != null && !n1.isWall) || (n2 != null && !n2.isWall);
        }

        if (canAddDiagonal(west, north))
            addNeighbor(this.p5.getNode(this.r - 1, this.c - 1));
        if (canAddDiagonal(north, east))
            addNeighbor(this.p5.getNode(this.r - 1, this.c + 1));
        if (canAddDiagonal(east, south))
            addNeighbor(this.p5.getNode(this.r + 1, this.c + 1));
        if (canAddDiagonal(south, west))
            addNeighbor(this.p5.getNode(this.r + 1, this.c - 1));

        return neighbors;
    }

    isDiagonal(other) {
        return (this.r - 1 == other.r && this.c - 1 == other.c)
            || (this.r - 1 == other.r && this.c + 1 == other.c)
            || (this.r + 1 == other.r && this.c + 1 == other.c)
            || (this.r + 1 == other.r && this.c - 1 == other.c);
    }
}