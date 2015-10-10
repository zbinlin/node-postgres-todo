"use strict";

import coViews from "co-views";

export default function views(dir = "views", opts = {}) {
    let render = coViews(dir, opts);

    return function* _views(next) {
        if (this.render) return yield next;

        this.render = function (...args) {
            return render(...args);
        }

        return yield next;
    };
}
