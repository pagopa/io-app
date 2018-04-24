/**
 * Implements the APIs to interact with the backend.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export function getUserProfile(apiUrlPrefix, token) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(`${apiUrlPrefix}/api/v1/profile`, {
                method: 'get',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const responseJson = yield response.json();
            return responseJson;
        }
        catch (error) {
            return null;
            // TODO handle error
            // console.error(error)
        }
    });
}
export function setUserProfile(apiUrlPrefix, token, newProfile) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(`${apiUrlPrefix}/api/v1/profile`, {
                method: 'post',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newProfile)
            });
            // eslint-disable-next-line no-magic-numbers
            if (response.status === 500) {
                return response.status;
            }
            else {
                const responseJson = yield response.json();
                return responseJson;
            }
        }
        catch (error) {
            return null;
            // if the proxy is not reacheable
            // TODO handle unsuccessful fetch
            // @see https://www.pivotaltracker.com/story/show/154661120
        }
    });
}
export function isDemoIdp(idp) {
    return idp.id === 'demo';
}
//# sourceMappingURL=api.js.map