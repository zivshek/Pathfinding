class Cmd {
    constructor(action, nodes, p) {
        this.action = action;
        this.nodes = nodes;
        this.p = p;
    }

    undo() {
        switch (this.action) {
            case 1: // painting wall
            case 2:
                this.nodes.forEach(node => {
                    this.p.setWall(node, false);
                });
                break;
            case 3: // erasing wall
            case 4:
                this.nodes.forEach(node => {
                    this.p.setWall(node, true);
                });
                break;
        }
    }

    addNode(n) {
        this.nodes.push(n);
    }
}