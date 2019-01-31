const FetchWorkerTool = require('./FetchWorkerTool');
const FetchTool = require('./FetchTool');
const NetsTool = require('./NetsTool');

/**
 * Get and send assets with other tools in sequence.
 */
class ProxyTool {
    constructor () {
        this.tools = [
            new FetchWorkerTool(),
            new FetchTool(),
            new NetsTool()
        ];
    }

    /**
     * Is get supported? false if all proxied tool return false.
     * @returns {boolean} Is get supported?
     */
    get getSupported () {
        return this.tools.some(tool => tool.getSupported);
    }

    /**
     * Request data from with one of the proxied tools.
     * @param {{url:string}} reqConfig - Request configuration for data to get.
     * @param {{method:string}} options - Additional options to configure fetch.
     * @returns {Promise.<Buffer>} Resolve to Buffer of data from server.
     */
    get (reqConfig, options) {
        let toolIndex = 0;
        const nextTool = err => {
            const tool = this.tools[toolIndex++];
            if (!tool.getSupported) {
                return nextTool(err);
            }
            if (!tool) {
                throw err;
            }
            try {
                const getPromise = tool.get(reqConfig, options);
                if (getPromise === null) {
                    return nextTool();
                }
                return getPromise.catch(nextTool);
            } catch (_err) {
                return nextTool(_err);
            }
        };
        return nextTool();
    }

    /**
     * Is sending supported? false if all proxied tool return false.
     * @returns {boolean} Is sending supported?
     */
    get sendSupported () {
        return this.tools.some(tool => tool.sendSupported);
    }

    /**
     * Send data to a server with one of the proxied tools.
     * @param {{url:string}} reqConfig - Request configuration for data to send.
     * @param {*} data - Data to send.
     * @param {string} method - HTTP method to sending the data as.
     * @returns {Promise.<Buffer|string|object>} Server returned metadata.
     */
    send (reqConfig, data, method) {
        let toolIndex = 0;
        const nextTool = err => {
            const tool = this.tools[toolIndex++];
            if (!tool.sendSupported) {
                return nextTool(err);
            }
            if (!tool) {
                throw err;
            }
            return tool.send(reqConfig, data, method).catch(nextTool);
        };
        return nextTool();
    }
}

module.exports = ProxyTool;
