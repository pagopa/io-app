import { flow, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as E from "fp-ts/lib/Either";
import { getType } from "typesafe-actions";
import doubtImage from "../../../../img/pictograms/doubt.png";
import authorizationDenied from "../../../../img/servicesStatus/error-detail-icon.png";
import genericError from "../../../../img/wallet/errors/generic-error-icon.png";
import paymentUnavailableIcon from "../../../../img/wallet/errors/payment-unavailable-icon.png";
import cardProblemOrOperationCanceled from "../../../../img/wallet/errors/payment-unknown-icon.png";
import I18n from "../../../i18n";
import {
  OutcomeCode,
  OutcomeCodes,
  OutcomeCodesKey
} from "../../../types/outcomeCode";
import { Action } from "../../actions/types";
import {
  addCreditCardOutcomeCode,
  paymentOutcomeCode,
  resetLastPaymentOutcomeCode
} from "../../actions/wallet/outcomeCode";
import { GlobalState } from "../types";

export type OutcomeCodeState = {
  outcomeCode: O.Option<OutcomeCode>;
};
const initialOutcomeCodeState: OutcomeCodeState = {
  outcomeCode: O.none
};

// TODO: As refinement make the outcomeCodes list remote, like backend status.
// This data structure replicates the future remote data structure.
const OutcomeCodesPrintable = (): OutcomeCodes => ({
  "0": {
    status: "success"
  },
  "1": {
    title: {
      "en-EN": I18n.t("wallet.outcomeMessage.code1.title"),
      "it-IT": I18n.t("wallet.outcomeMessage.code1.title")
    },
    description: {
      "en-EN": I18n.t("wallet.outcomeMessage.code1.description"),
      "it-IT": I18n.t("wallet.outcomeMessage.code1.description")
    },
    icon: genericError,
    status: "errorBlocking"
  },
  "2": {
    title: {
      "en-EN": I18n.t("wallet.outcomeMessage.code2.title"),
      "it-IT": I18n.t("wallet.outcomeMessage.code2.title")
    },
    description: {
      "en-EN": I18n.t("wallet.outcomeMessage.code2.description"),
      "it-IT": I18n.t("wallet.outcomeMessage.code2.description")
    },
    icon: authorizationDenied,
    status: "errorBlocking"
  },
  "3": {
    title: {
      "en-EN": I18n.t("wallet.outcomeMessage.code3.title"),
      "it-IT": I18n.t("wallet.outcomeMessage.code3.title")
    },
    description: {
      "en-EN": I18n.t("wallet.outcomeMessage.code3.description"),
      "it-IT": I18n.t("wallet.outcomeMessage.code3.description")
    },
    icon: doubtImage,
    status: "errorBlocking"
  },
  "4": {
    title: {
      "en-EN": I18n.t("wallet.outcomeMessage.code4.title"),
      "it-IT": I18n.t("wallet.outcomeMessage.code4.title")
    },
    description: {
      "en-EN": I18n.t("wallet.outcomeMessage.code4.description"),
      "it-IT": I18n.t("wallet.outcomeMessage.code4.description")
    },
    icon: paymentUnavailableIcon,
    status: "errorBlocking"
  },
  "7": {
    title: {
      "en-EN": I18n.t("wallet.outcomeMessage.code7.title"),
      "it-IT": I18n.t("wallet.outcomeMessage.code7.title")
    },
    description: {
      "en-EN": I18n.t("wallet.outcomeMessage.code7.description"),
      "it-IT": I18n.t("wallet.outcomeMessage.code7.description")
    },
    icon: cardProblemOrOperationCanceled,
    status: "errorBlocking"
  },
  "8": {
    title: {
      "en-EN": I18n.t("wallet.outcomeMessage.code8.title"),
      "it-IT": I18n.t("wallet.outcomeMessage.code8.title")
    },
    icon: cardProblemOrOperationCanceled,
    status: "errorBlocking"
  },
  "10": {
    title: {
      "en-EN": I18n.t("wallet.outcomeMessage.code10.title"),
      "it-IT": I18n.t("wallet.outcomeMessage.code10.title")
    },
    description: {
      "en-EN": I18n.t("wallet.outcomeMessage.code10.description"),
      "it-IT": I18n.t("wallet.outcomeMessage.code10.description")
    },
    icon: authorizationDenied,
    status: "errorBlocking"
  },
  "15": {
    title: {
      "en-EN": I18n.t("wallet.outcomeMessage.code15.title"),
      "it-IT": I18n.t("wallet.outcomeMessage.code15.title")
    },
    description: {
      "en-EN": I18n.t("wallet.outcomeMessage.code15.description"),
      "it-IT": I18n.t("wallet.outcomeMessage.code15.description")
    },
    icon: doubtImage,
    status: "errorBlocking"
  },
  "18": {
    title: {
      "en-EN": I18n.t("wallet.outcomeMessage.code18.title"),
      "it-IT": I18n.t("wallet.outcomeMessage.code18.title")
    },
    description: {
      "en-EN": I18n.t("wallet.outcomeMessage.code18.description"),
      "it-IT": I18n.t("wallet.outcomeMessage.code18.description")
    },
    icon: authorizationDenied,
    status: "errorBlocking"
  },
  "19": {
    title: {
      "en-EN": I18n.t("wallet.outcomeMessage.code19.title"),
      "it-IT": I18n.t("wallet.outcomeMessage.code19.title")
    },
    description: {
      "en-EN": I18n.t("wallet.outcomeMessage.code19.description"),
      "it-IT": I18n.t("wallet.outcomeMessage.code19.description")
    },
    icon: authorizationDenied,
    status: "errorBlocking"
  }
});

// This fallback is used both for unexpected code and for code that we don't want to map specifically.
const fallbackOutcomeCodes = (): OutcomeCode => ({
  title: {
    "en-EN": I18n.t("wallet.outcomeMessage.fallback.title"),
    "it-IT": I18n.t("wallet.outcomeMessage.fallback.title")
  },
  description: {
    "en-EN": I18n.t("wallet.outcomeMessage.fallback.description"),
    "it-IT": I18n.t("wallet.outcomeMessage.fallback.description")
  },
  icon: genericError,
  status: "errorBlocking"
});

// This function extracts, given an Option<string>, the outcomeCode object from the OutcomeCodesPrintable object
// that contains the list of outcome codes.
// If the string is none or if the the code is not a key of the OutcomeCodesPrintable the fallback outcome code object is returned.
export const extractOutcomeCode = (
  code: O.Option<string>
): O.Option<OutcomeCode> =>
  pipe(
    code,
    O.fold(
      () => O.some(fallbackOutcomeCodes()),
      flow(
        OutcomeCodesKey.decode,
        E.fold(
          _ => O.some(fallbackOutcomeCodes()),
          oCK => O.some(OutcomeCodesPrintable()[oCK])
        )
      )
    )
  );

export default function outcomeCodeReducer(
  state: OutcomeCodeState = initialOutcomeCodeState,
  action: Action
): OutcomeCodeState {
  switch (action.type) {
    case getType(paymentOutcomeCode):
      return { outcomeCode: extractOutcomeCode(action.payload.outcome) };
    case getType(addCreditCardOutcomeCode):
      return { outcomeCode: extractOutcomeCode(action.payload) };
    case getType(resetLastPaymentOutcomeCode):
      return initialOutcomeCodeState;
    default:
      return state;
  }
}

export const lastPaymentOutcomeCodeSelector = (
  state: GlobalState
): OutcomeCodeState => state.wallet.lastPaymentOutcomeCode;

// TODO replace with a selector when this data will be into the store
export const outcomeCodesSelector = (_: GlobalState): OutcomeCodes =>
  OutcomeCodesPrintable();
