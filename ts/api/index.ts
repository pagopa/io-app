/**
 * This file export the Proxy apisauce client
 *
 * TODO: Create a mocked version of the ProxyApi @https://www.pivotaltracker.com/story/show/157483031
 */

import ProxyApi from "./ProxyApi";

const proxyApi = ProxyApi.create();

export { proxyApi };
