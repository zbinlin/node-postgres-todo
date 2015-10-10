"use strict";

import handlebars from "handlebars";


const helpers = Object.create(null);

helpers["plug"] = function (a, b) {
    return a + b;
};

export default helpers;
