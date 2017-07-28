var test = require('../Shared/test');

module.exports = {
    fn: fn,
};

function fn(context, req) {
    context.log('Node.js HTTP trigger function processed a request. Name=%s', req.query.name);

         res = {
            status: 200,
            body: "Function in t1",
            headers: {
                'Content-Type': 'text/plain',
                'Shared-Module': test.timestamp
            }
        };

    context.done(null, res);
};
