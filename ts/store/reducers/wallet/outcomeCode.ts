import { Option } from "fp-ts/lib/Option";
import { pot } from "italia-ts-commons";
import { getType } from "typesafe-actions";
import {
  OutcomeCode,
  OutcomeCodes,
  OutcomeCodesKey
} from "../../../types/outcomeCode";
import { Action } from "../../actions/types";
import { outcomeCodeRetrieved } from "../../actions/wallet/outcomeCode";
import { GlobalState } from "../types";

export type OutcomeCodeState = {
  outcomeCode: pot.Pot<OutcomeCode, Error>;
};
const initialOutcomeCodeState: OutcomeCodeState = {
  outcomeCode: pot.none
};

// TODO: make the outcomeCodes list remote
const OutcomeCodesPrintable: OutcomeCodes = {
  "0": {
    title: {
      "en-EN": "",
      "it-IT": ""
    },
    description: {
      "en-EN": "",
      "it-IT": ""
    },
    icon: "",
    status: "success"
  },
  "1": {
    title: {
      "en-EN": "",
      "it-IT": ""
    },
    description: {
      "en-EN": "",
      "it-IT": ""
    },
    icon: "",
    status: "errorBlocking"
  },
  "2": {
    title: {
      "en-EN": "",
      "it-IT": ""
    },
    description: {
      "en-EN": "",
      "it-IT": ""
    },
    icon: "",
    status: "errorTryAgain"
  }
};
const fallbackOutcomeCodes: OutcomeCode = {
  title: {
    "en-EN": "fallback title",
    "it-IT": "fallback title"
  },
  description: {
    "en-EN": "fallback description",
    "it-IT": "fallback description"
  },
  icon: "",
  status: "errorBlocking"
};

const extractOutcomeCode = (
  code: Option<string>
): pot.Pot<OutcomeCode, Error> =>
  code.fold(pot.some(fallbackOutcomeCodes), c =>
    OutcomeCodesKey.decode(c).fold(
      _ => pot.some(fallbackOutcomeCodes),
      oCK => pot.some(OutcomeCodesPrintable[oCK])
    )
  );

export default function outcomeCodeReducer(
  state: OutcomeCodeState = initialOutcomeCodeState,
  action: Action
): OutcomeCodeState {
  if (action.type === getType(outcomeCodeRetrieved)) {
    return { outcomeCode: extractOutcomeCode(action.payload) };
  }
  return state;
}

export const lastPaymentOutcomeCodeSelector = (
  state: GlobalState
): OutcomeCodeState => state.wallet.lastPaymentOutcomeCode;
