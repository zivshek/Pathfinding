class CustomButton {

    constructor(x, y, w, h, text, p5, visible = true) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.text = text;
        this.p5 = p5;
        this.visible = visible;
    }

    setVisible(visible) {
        this.visible = visible;
    }

    setText(text) {
        this.text = text;
    }

    clicked(mx, my) {
        // since we r using rectMode(CENTER), (x, y) would be the center point of the rect
        return (mx > this.x - this.w / 2 && mx < this.x + this.w / 2 && my > this.y - this.h / 2 && my < this.y + this.h / 2);
    }

    draw(color) {
        if (!this.visible)
            return;

        this.p5.push();
        this.p5.stroke(0);
        this.p5.strokeWeight(0.5);
        this.p5.rectMode(this.p5.CENTER);
        this.p5.textAlign(this.p5.CENTER);
        this.p5.fill(color);
        this.p5.rect(this.x - 1, this.y, this.w - 1, this.h);
        this.p5.textSize(20);
        this.p5.fill(0);
        this.p5.strokeWeight(0);
        this.p5.text(this.text, this.x, this.y + this.h / 4.5);
        this.p5.pop();
    }
}