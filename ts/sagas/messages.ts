/**
 * A saga that manages the Messages.
 */

import { takeLatest, call, put, select, Effect } from "redux-saga/effects";
import {
  MESSAGES_LOAD_REQUEST,
  MESSAGES_LOAD_SUCCESS,
  MESSAGES_LOAD_FAILURE
} from "../store/actions/constants";

import {
  ApiFetchResult,
  ApiMessages,
  ApiMessage,
  fetchMessages,
  isApiFetchFailure
} from "../api";
import { GlobalState } from "../reducers/types";
// A selector to get the token from the state
const getSessionToken = (state: GlobalState): string | null =>
  state.session.isAuthenticated ? state.session.token : null;
type InterfaceListMessages = {
  [id: string]: {
    id: string;
    date: string;
    content: { subject: string; markup: string };
    sender_service_id: string;
  };
};
function normalizeMessages(messages: ApiMessages) {
  let listMessages: InterfaceListMessages | {} = {};
  const messagesAllIds: string[] = [];
  const messagesList: ReadonlyArray<ApiMessage> = messages.messages;
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
  messagesList.forEach(value => {
    listMessages = {
      ...listMessages,
      [value.id]: {
        id: value.id,
        date: formatDate(value.date),
        content: value.content,
        sender_service_id: value.sender_service_id
      }
    };
    messagesAllIds.push(value.id);
  });
  return {
    messages: {
      byId: listMessages
    },
    allIds: messagesAllIds
  };
}

function formatDate(date: string): string {
  const a = new Date(date * 1000);

  const nowDate = new Date();
  const nowYear = nowDate.getFullYear();
  const nowDateD = nowDate.getDate();
  const months: ReadonlyArray<string> = [
    "01",
    "02",
    "03",
    "04",
    "05",
    "06",
    "07",
    "08",
    "09",
    "10",
    "11",
    "12"
  ];
  const nowDateM = months[nowDate.getUTCMonth()];
  const y = a.getFullYear();
  const d = a.getDate();
  const m = months[a.getUTCMonth()];
  const h = a.getHours();
  const min = a.getMinutes();

  if (nowYear === y && nowDateM === m && nowDateD === d) {
    if (min < 9) {
      return `${h}.0${min}`;
    } else {
      return `${h}.${min}`;
    }
  } else {
    if (nowYear === y && nowDateM === m && nowDateD - 1 === d) {
      return "ieri";
    } else {
      return `${d}/${m}`;
    }
  }
}

function* loadMessages(): Iterator<Effect> {
  try {
    // Get the token from the state
    const token: string = yield select(getSessionToken);

    // Fetch the profile from the proxy
    const response: ApiFetchResult<ApiMessages> = yield call(
      fetchMessages,
      token
    );

    if (isApiFetchFailure(response)) {
      // If the api response is an error then dispatch the MESSAGES_LOAD_FAILURE action.
      yield put({
        type: MESSAGES_LOAD_FAILURE,
        payload: response.error
      });
    } else {
      // If the api returns a valid Profile then dispatch the MESSAGES_LOAD_SUCCESS action.
      yield put({
        type: MESSAGES_LOAD_SUCCESS,
        payload: normalizeMessages(response.result)
      });
    }
  } catch (error) {
    // If the api request raise an exception then dispatch the MESSAGES_LOAD_FAILURE action.
    yield put({ type: MESSAGES_LOAD_FAILURE, payload: error });
  }
}

// This function listens for Messages request
export default function* root(): Iterator<Effect> {
  yield takeLatest(MESSAGES_LOAD_REQUEST, loadMessages);
}
