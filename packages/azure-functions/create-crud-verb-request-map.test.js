'use strict';

const createCrudVerbReqMap = require('./create-crud-verb-request-map');

describe('Azure-Functions', () => {
    describe('createCrudVerbReqMap', () => {
        it('should work', () => {
            /** @type {import('../mongodb/types').Query} */
            const query = { filter: {} };
            /** @type {import('./types').CrudService} */
            const service = {
                getById: async () => {},
                search: async () => [{}],
                create: async () => {},
                replaceById: async () => {},
                deleteById: async () => null,
                mapQueryString: () => query,
            };
            const map = createCrudVerbReqMap(service);
            expect(map.GET).to.be.ok;
            expect(map.POST).to.be.ok;
            expect(map.PUT).to.be.ok;
            expect(map.DELETE).to.be.ok;
            //todo RK await results
        });
    });
});
