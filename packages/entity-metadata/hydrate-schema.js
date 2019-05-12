'use strict';
module.exports = function hydrateSchema(schema, metadata) {
    schema.properties = schema.properties || {};
    schema.required = schema.required || [];
    addIdentifier(schema, metadata);
    // addStatusInfo(schema);
    // addOwnerInfo(schema);
};

function addIdentifier(schema, metadata) {
    const identifier = metadata.identifier;
    if (schema.properties[identifier.name]) {
        return;
    }
    schema.properties[identifier.name] = Object.assign({}, identifier.schema);
    schema.required.push(identifier.name);
}

// function addStatusInfo(schema) {
//     if (!schema.statuses) {
//         return;
//     }
//     if (!schema.updateStatusSchema) {
//         throw new Error(
//             'Cannot have statuses array specified on the schema but not provide an updateStatusSchema property'
//         );
//     }
//     const statusNames = schema.statuses.map(status => status.name);
//     schema.properties.status = {
//         type: 'string',
//         enum: statusNames,
//     };
//     schema.properties.statusDate = {
//         type: 'string',
//         format: 'date-time',
//         faker: 'date.past',
//     };
//     schema.properties.statusLog = {
//         type: 'array',
//         items: {
//             type: 'object',
//             properties: {
//                 status: schema.properties.status,
//                 statusDate: schema.properties.statusDate,
//                 data: schema.updateStatusSchema, //todo anyof?
//             },
//             required: ['status', 'statusDate', 'data'], //todo - data check schema anyof?
//             additionalProperties: false,
//         },
//         additionalItems: false,
//     };
//     schema.required.push('status');
//     schema.required.push('statusDate');
//     schema.required.push('statusLog');
// }

// function addOwnerInfo(schema) {
//     if (!schema.ownership) {
//         return;
//     }
//     schema.properties.owner = {
//         type: 'string',
//         format: 'mongoId',
//         mongoId: true,
//         minLength: 24,
//         maxLength: 24,
//     };
//     schema.properties.ownerDate = {
//         type: 'string',
//         format: 'date-time',
//         faker: 'date.past',
//     };
//     schema.properties.ownerLog = {
//         type: 'array',
//         items: {
//             type: 'object',
//             properties: {
//                 owner: schema.properties.owner,
//                 ownerDate: schema.properties.ownerDate,
//                 data: {
//                     type: ['object', 'string'], //todo?
//                 },
//             },
//             required: ['owner', 'ownerDate', 'data'], //todo - data check schema anyof?
//             additionalProperties: false,
//         },
//         additionalItems: false,
//     };
//     schema.required.push('owner');
//     schema.required.push('ownerDate');
//     schema.required.push('ownerLog');
// }
