class Cmd {
    constructor(action, nodes, p) {
        this.action = action;
        this.nodes = nodes;
        this.p = p;
    }

    undo() {
        switch (this.action) {
            case State.PAINTING_WALL_SINGLE: // painting wall
            case State.PAINTING_WALL_MULTIPLE:
                this.nodes.forEach(node => {
                    this.p.setWall(node, false);
                });
                break;
            case State.ERASING_WALL_SINGLE: // erasing wall
            case State.ERASING_WALL_MULTIPLE:
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