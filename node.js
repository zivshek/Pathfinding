
class Node {
    constructor(r, c, size, p5) {
        this.f = 0;
        this.g = Infinity;
        this.h = 0;

        this.r = r;
        this.c = c;
        this.size = size;
        this.x = this.c * this.size;
        this.y = this.r * this.size;
        this.p5 = p5;
        this.neighbors = [];
    }

    draw(color) {
        this.p5.stroke(0);
        this.p5.fill(color);
        this.p5.rect(this.x, this.y, this.size, this.size);
    }
    
    mouseIn(mx, my) {
        return (mx > this.x && mx < this.x + this.size && my > this.y && my < this.y + this.size);
    }

    addNeighbors(rows, cols) {
        if (this.r < rows - 1)
            this.neighbors.push(this.p5.getNode(this.r + 1, this.c));
        if (this.r > 0)
            this.neighbors.push(this.p5.getNode(this.r - 1, this.c));
        if (this.c < cols - 1)
            this.neighbors.push(this.p5.getNode(this.r, this.c + 1));
        if (this.c > 0)
            this.neighbors.push(this.p5.getNode(this.r, this.c - 1));
    }
}