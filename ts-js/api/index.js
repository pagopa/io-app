/**
 * This file collects all the functions/types required to interact with the Proxy API.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { apiUrlPrefix } from '../config';
// Prefixes for LOGIN SUCCESS/ERROR
const LOGIN_SUCCESS_PREFIX = '/profile.html?token=';
const LOGIN_FAILURE_PREFIX = '/error.html';
export const extractLoginResult = (url) => {
    // Check for LOGIN_SUCCESS
    let tokenPathPos = url.indexOf(LOGIN_SUCCESS_PREFIX);
    // eslint-disable-next-line no-magic-numbers
    if (tokenPathPos !== -1) {
        const token = url.substr(tokenPathPos + LOGIN_SUCCESS_PREFIX.length);
        // eslint-disable-next-line no-magic-numbers
        if (token && token.length > 0) {
            return {
                success: true,
                token: token
            };
        }
        else {
            return {
                success: false
            };
        }
    }
    // Check for LOGIN_FAILURE
    tokenPathPos = url.indexOf(LOGIN_FAILURE_PREFIX);
    // eslint-disable-next-line no-magic-numbers
    if (tokenPathPos !== -1) {
        return {
            success: false
        };
    }
    // Url is not LOGIN related
    return null;
};
// Fetch the profile from the Proxy
export const fetchProfile = (token) => __awaiter(this, void 0, void 0, function* () {
    const response = yield fetch(`${apiUrlPrefix}/api/v1/profile`, {
        method: 'get',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    if (response.ok) {
        const profile = yield response.json();
        return {
            isError: false,
            result: profile
        };
    }
    else {
        return {
            isError: true,
            error: new Error('Error fetching profile')
        };
    }
});
// Send a new version of the profile to the Proxy
export const postProfile = (token, newProfile) => __awaiter(this, void 0, void 0, function* () {
    const response = yield fetch(`${apiUrlPrefix}/api/v1/profile`, {
        method: 'post',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newProfile)
    });
    if (response.ok) {
        const profile = yield response.json();
        return {
            isError: false,
            result: profile
        };
    }
    else {
        return {
            isError: true,
            error: new Error('Error posting profile')
        };
    }
});
//# sourceMappingURL=index.js.map