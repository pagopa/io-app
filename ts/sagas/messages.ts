/**
 * A saga that manages the Messages.
 */

import { takeLatest, call, put, select, Effect } from 'redux-saga/effects'

import {
  MESSAGES_LOAD_REQUEST,
  MESSAGES_LOAD_SUCCESS,
  MESSAGES_LOAD_FAILURE, PROFILE_LOAD_FAILURE, PROFILE_LOAD_SUCCESS, PROFILE_UPDATE_REQUEST, PROFILE_LOAD_REQUEST
} from '../store/actions/constants'

import {
  ApiFetchResult,
  ApiMessages,
  fetchMessages,
  isApiFetchFailure
} from '../api'
import { GlobalState } from '../reducers/types'

// A selector to get the token from the state
const getSessionToken = (state: GlobalState): string | null =>
  state.session.isAuthenticated ? state.session.token : null

function normalizeMessages(messages) {
  let listMessages={};
  let allIds = [];
  let normalizedMessages;
  const messagesList = messages.messages;
  /*
  OUTPUT EXAMPLE
  {
    messages : {
      byId : {
        "XXXXX" : {
          id: XXXXX,
          date: "10/04/2018",
          content : {subject: "test", markdown: "body"},
          sender_service_id: "xyxyxyxy"
        },
        "YYYYY" : {
          id: XXXXX,
          date: "10/04/2018",
          content : {subject: "test2", markdown: "body2"},
          sender_service_id: "zuzuzuzu"
        }
      },
      allIds : ["XXXXX", "YYYYY"]
    }
  }
   */
  Object.keys(messagesList).forEach(function(key) {
    listMessages = {...listMessages,
        [messagesList[key].id] : {
          id : messagesList[key].id,
          date: messagesList[key].date,
          content: messagesList[key].content,
          sender_service_id: messagesList[key].sender_service_id
       }
     }
    allIds.push(messagesList[key].id);
    });
  normalizedMessages= Object.assign({},{
    messages: {
      byId: listMessages
    },
    allIds: allIds
  });
  return normalizedMessages;
}

function* loadMessages(): Iterator<Effect> {try {

  // Get the token from the state
  const token: string = yield select(getSessionToken)

  // Fetch the profile from the proxy
  const response: ApiFetchResult<ApiMessages> = yield call(fetchMessages, token)

  if (isApiFetchFailure(response)) {
    // If the api response is an error then dispatch the MESSAGES_LOAD_FAILURE action.
    yield put({
      type: MESSAGES_LOAD_FAILURE,
      payload: response.error
    })
  } else {
    // If the api returns a valid Profile then dispatch the MESSAGES_LOAD_SUCCESS action.
    yield put({ type: MESSAGES_LOAD_SUCCESS, payload: normalizeMessages(response.result) })
  }
} catch (error) {
  // If the api request raise an exception then dispatch the MESSAGES_LOAD_FAILURE action.
  yield put({ type: MESSAGES_LOAD_FAILURE , payload: error })
}

}

// This function listens for Messages request
export default function* root(): Iterator<Effect> {
  yield takeLatest(MESSAGES_LOAD_REQUEST, loadMessages)
}
