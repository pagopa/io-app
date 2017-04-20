/**
 * @flow
 */

'use strict';

import type { Action } from './types';

function logIn(token: string): Action {
  return {
    type: 'LOGGED_IN',
    data: {
      token: token,
    }
  };
}

function logOut(): Action {
  return {
    type: 'LOGGED_OUT',
  };
}

module.exports = {
  logIn,
  logOut
};
