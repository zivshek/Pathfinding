
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
    }

    draw() {
        this.p5.stroke(0);
        this.p5.fill(255);
        this.p5.rect(this.x, this.y, this.size, this.size);
    }
    
    mouseIn(mx, my) {
        return (mx > this.x && mx < this.x + this.size && my > this.y && my < this.y + this.size);
    }
}