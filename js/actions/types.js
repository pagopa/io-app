/**
 * @flow
 */

'use strict';

export type Action =
  | { type: 'LOGGED_IN', source: ?string; data: { id: string; name: string; } }
  | { type: 'LOGGED_OUT' }
;

export type Dispatch = (action: Action | ThunkAction | PromiseAction | Array<Action>) => any;
export type GetState = () => Object;
export type ThunkAction = (dispatch: Dispatch, getState: GetState) => any;
export type PromiseAction = Promise<Action>;
