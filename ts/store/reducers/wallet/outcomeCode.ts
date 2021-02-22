import { Option } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import I18n from "../../../i18n";
import {
  OutcomeCode,
  OutcomeCodes,
  OutcomeCodesKey
} from "../../../types/outcomeCode";
import { Action } from "../../actions/types";
import { outcomeCodeRetrieved } from "../../actions/wallet/outcomeCode";
import authorizationDenied from "../../../../img/servicesStatus/error-detail-icon.png";
import genericError from "../../../../img/wallet/errors/generic-error-icon.png";
import sessionExpired from "../../../../img/wallet/errors/payment-expired-icon.png";
import cardProblemOrOperationCanceled from "../../../../img/wallet/errors/payment-unknown-icon.png";
import { GlobalState } from "../types";

export type OutcomeCodeState = {
  outcomeCode: pot.Pot<OutcomeCode, Error>;
};
const initialOutcomeCodeState: OutcomeCodeState = {
  outcomeCode: pot.none
};

// TODO: As refinement make the outcomeCodes list remote, like backend status.
// This data structure replicates the future remote data structure.
const OutcomeCodesPrintable: OutcomeCodes = {
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
  "4": {
    title: {
      "en-EN": I18n.t("wallet.outcomeMessage.code4.title"),
      "it-IT": I18n.t("wallet.outcomeMessage.code4.title")
    },
    description: {
      "en-EN": I18n.t("wallet.outcomeMessage.code4.description"),
      "it-IT": I18n.t("wallet.outcomeMessage.code4.description")
    },
    icon: sessionExpired,
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
  }
};

// This fallback is used both for unexpected code and for code that we don't want to map specifically.
const fallbackOutcomeCodes: OutcomeCode = {
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
