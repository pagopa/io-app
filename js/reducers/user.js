/**
 * @flow
 */

'use strict';

import type { Action } from '../actions/types';

export type UserState = {
  isLoggedIn: boolean,
  token: ?string,
  name?: ?string,
};

const initialUserState = {
  isLoggedIn: false,
  token: null,
  name: null,
};

function user(state: UserState = initialUserState, action: Action): UserState {
  if (action.type === 'LOGGED_IN') {
    let { token } = action.data;
    return {
      isLoggedIn: true,
      token,
    };
  }
  if (action.type === 'LOGGED_OUT') {
    return initialUserState;
  }
  return state;
}

module.exports = user;
