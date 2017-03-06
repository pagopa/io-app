/**
 * @flow
 */

'use strict';

import type { Action } from './types';
import type { IdentityProvider } from '../types';

function loginWithIdp(idp: IdentityProvider): Action {
  return {
    type: 'LOGGED_IN',
    data: {
      id: '12345',
      name: 'Federico Feroldi',
      idpId: 'poste',
    }
  };
}

function logOut(): Action {
  return {
    type: 'LOGGED_OUT',
  };
}

module.exports = {
  loginWithIdp,
  logOut
};
