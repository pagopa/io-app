/**
 * @flow
 */

'use strict';

import type {Action} from '../actions/types';

export type UserState = {
  isLoggedIn: boolean;
  id: ?string;
  name: ?string;
  idpId: ?string;
};

const initialUserState = {
  isLoggedIn: false,
  id: null,
  name: null,
  idpId: null,
};

function user(state: UserState = initialUserState, action: Action): UserState {
  if (action.type === 'LOGGED_IN') {
    let {id, name, idpId} = action.data;
    return {
      isLoggedIn: true,
      id,
      name,
      idpId,
    };
  }
  if (action.type === 'LOGGED_OUT') {
    return initialUserState;
  }
  return state;
}

module.exports = user;
