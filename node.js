
class Node {
    constructor(r, c, size, marginx, marginy, p5) {
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
        this.neighbors = [];
        this.cameFrom = undefined;
    }

    draw(color) {
        this.p5.rectMode(this.p5.CORNER);
        this.p5.stroke(0);
        this.p5.fill(color);
        this.p5.rect(this.x, this.y, this.size, this.size);
    }

    isWall() {
        return this.isWall;
    }

    setIsWall(isWall) {
        this.isWall = isWall;
    }

    addNeighbors(rows, cols) {
        if (this.r < rows - 1)
            this.addNeighbor(this.r + 1, this.c);
        if (this.r > 0)
            this.addNeighbor(this.r - 1, this.c);
        if (this.c < cols - 1)
            this.addNeighbor(this.r, this.c + 1);
        if (this.c > 0)
            this.addNeighbor(this.r, this.c - 1);
    }

    addNeighbor(r, c) {
        let node = this.p5.getNode(r, c);
        if (!node.isWall)
            this.neighbors.push(node);
    }
}