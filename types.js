const State = {
    NONE: 'none',
    PAINTING_WALL_SINGLE: 'paint_s',
    PAINTING_WALL_MULTIPLE: 'paint_mul',
    ERASING_WALL_SINGLE: 'erasing_s',
    ERASING_WALL_MULTIPLE: 'erasing_mul',
    DRAGGING_START: 'dragging_start',
    DRAGGING_END: 'dragging_end',
    CALCULATING: 'calculating',
    PAUSED: 'paused'
};

const NeighborType = {
    TopLeft: 0,
    Top: 1,
    TopRight: 2,
    Right: 3,
    BottomRight: 4,
    Bottom: 5,
    BottomLeft: 6,
    Left: 7,

    Total: 8
};