class CustomButton {

    constructor(x, y, w, h, text, p5) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.text = text;
        this.fontColor = 'rgb(52, 66, 145)';
        this.p5 = p5;
    }

    clicked(mx, my) {
        // since we r using rectMode(CENTER), (x, y) would be the center point of the rect
        return (mx > this.x - this.w/2 && mx < this.x + this.w/2 && my > this.y - this.h/2 && my < this.y + this.h/2);
    }

    draw(color) {
        this.p5.rectMode(this.p5.CENTER);
        this.p5.fill(color);
        this.p5.rect(this.x, this.y, this.w, this.h);
        this.p5.textSize(20);
        this.p5.fill(this.fontColor);
        this.p5.text(this.text, this.x, this.y + this.h/4.5);
    }
}