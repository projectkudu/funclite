var timestamp = new Date().getTime();

module.exports = {
    timestamp: timestamp,
    greeting: function (name) {
        return 'Hello ' + name;
    },
    greetingWithFunctionName: function(name, functionName) {
        return "Hello " + name + " from " + functionName;
    }
};