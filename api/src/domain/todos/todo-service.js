'use strict';

const {
    inputValidator,
    outputValidator,
} = require(`../../validation/validators`);
const getMetadata = require(`./todo-metadata`);
const { getCrud } = require(`@bit/exigentcoder.common-modules.mongodb`);
const { getDb } = require(`../../mongodb`);

/** @type {import('@bit/exigentcoder.common-modules.mongodb/mongodb/crud/mongodb-crud').GetCrud} */
let _crud;
async function initCrud() {
    if (!_crud) {
        const db = await getDb();
        _crud = await getCrud({
            metadata: getMetadata(),
            inputValidator,
            outputValidator,
            db,
        });
    }
    return _crud;
}

async function create(entity, context) {
    const { create: _create } = await initCrud();
    return await _create(entity, context);
}

async function getById(id, context) {
    const { getById: _getById } = await initCrud();
    return await _getById(id, context);
}

async function deleteById(id, context) {
    const { deleteById: _deleteById } = await initCrud();
    await _deleteById(id, context);
}

async function replaceById(id, entity, context) {
    const { replaceById: _replaceById } = await initCrud();
    return await _replaceById(id, entity, context);
}

async function search(query, context) {
    const { search: _search } = await initCrud();
    return await _search(query, context);
}

module.exports = {
    getMetadata,
    create,
    getById,
    deleteById,
    replaceById,
    search,
};
