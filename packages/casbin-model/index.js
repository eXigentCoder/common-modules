'use strict';

const { newModel } = require(`casbin`);

function createModel() {
    const model = newModel();
    model.addDef(`r`, `r`, `sub, obj, act`);
    model.addDef(`p`, `p`, `sub, obj, act, eft`);
    model.addDef(`g`, `g`, `_, _`);
    model.addDef(`e`, `e`, `some(where (p.eft == allow)) && !some(where (p.eft == deny))`);
    model.addDef(
        `m`,
        `m`,
        `g(r.sub, p.sub) && regexMatch(r.obj, p.obj) && regexMatch(r.act, p.act)`
    );
    return model;
}

/**
 * @param {string} superAdminGroupName
 * @returns {string[]}
 */
function defaultPolicy(superAdminGroupName) {
    return [superAdminGroupName, `.*`, `.*`, `allow`];
}

module.exports = { createModel, defaultPolicy };
