/*!
 * Stars
 * A simple index page
 * https://gitee.com/milkpotatoes/stars
 * Copyright (c) 2024 milkpotatoes
 * MIT Licence
 */

const loadedModule = {};

class module {
    static set exports(module) {
        loadedModule[module.name] = module;
    }
}

function require(name) {
    if (name in loadedModule) {
        return loadedModule[name];
    } else {
        throw new Error('module is not exist');
    }
}

Object.defineProperties(window, {
    module: module,
    require: require,
});