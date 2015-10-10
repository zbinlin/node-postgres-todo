"use strict";

import path from "path";
import fs from "fs";

function readdir(dir, exts = [], depth = Infinity, dirs = []) {
    let files = fs.readdirSync(dir);
    for (let file of files) {
        let fp = path.join(dir, file);
        if (!fs.existsSync(fp)) continue;
        let stats = fs.statSync(fp);
        if (stats.isDirectory() && depth > 0) {
            readdir(fp, exts, depth - 1, dirs);
        } else if (stats.isFile()) {
            if (exts.some(ext => ext === path.extname(fp).slice(1))) {
                dirs.push(fp);
            }
        }
    }
    return dirs;
}

export default function (dir = "", opts) {
    const DEFAULT_OPTIONS = {
        exts: ["hbs", "html"],
        cache: false,
        depth: 1
    };
    opts = Object.assign(Object.create(null), DEFAULT_OPTIONS, opts);

    const baseDir = path.isAbsolute(dir) ? dir : path.join(__dirname, dir);

    const partials = Object.create(null);

    try {
        let files = readdir(baseDir, opts.exts, opts.depth);
        let rootDir = path.dirname(baseDir);
        files.reduce((partials, file) => {
            let key = relative(file, baseDir, true);
            let val = relative(file, rootDir, true);
            partials[key] = val;
            return partials;
        }, partials);
    } catch (ex) {
        throw ex;
    }

    function relative(fp, cwd, withoutExt) {
        let sfp = path.relative(cwd, fp);
        if (withoutExt) {
            return sfp.substring(0, sfp.length - path.extname(sfp).length);
        }
        return sfp;
    }

    return partials;
};
