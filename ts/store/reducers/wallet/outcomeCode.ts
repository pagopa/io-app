import { Option } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { getType } from "typesafe-actions";
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
      "it-IT": "Spiacenti, si è verificato un errore imprevisto"
    },
    description: {
      "en-EN": "",
      "it-IT": "Non è stato addebitato alcun importo."
    },
    icon: genericError,
    status: "errorBlocking"
  },
  "2": {
    title: {
      "en-EN": "",
      "it-IT": "Autorizzazione negata"
    },
    description: {
      "en-EN": "",
      "it-IT":
        "La tua banca non ha autorizzato l’operazione. Controlla di aver inserito correttamente i vari codici richiesti dalla tua banca."
    },
    icon: authorizationDenied,
    status: "errorBlocking"
  },
  "4": {
    title: {
      "en-EN": "",
      "it-IT": "Spiacenti, la sessione è scaduta"
    },
    description: {
      "en-EN": "",
      "it-IT":
        "Non è stato addebitato alcun importo. Per la tua sicurezza, hai a disposizione 5 minuti per completare l’operazione."
    },
    icon: sessionExpired,
    status: "errorBlocking"
  },
  "7": {
    title: {
      "en-EN": "",
      "it-IT": "C’è un problema con la tua carta"
    },
    description: {
      "en-EN": "",
      "it-IT":
        "Non è stato addebitato alcun importo. Per maggiori informazioni, contatta la tua banca."
    },
    icon: cardProblemOrOperationCanceled,
    status: "errorBlocking"
  },
  "8": {
    title: {
      "en-EN": "",
      "it-IT": "L’operazione è stata annullata"
    },
    description: {
      "en-EN": "",
      "it-IT": ""
    },
    icon: cardProblemOrOperationCanceled,
    status: "errorBlocking"
  },
  "10": {
    title: {
      "en-EN": "",
      "it-IT": "Autorizzazione negata"
    },
    description: {
      "en-EN": "",
      "it-IT":
        "Probabilmente hai sforato il massimale della tua carta. Verifica con la tua banca prima di riprovare."
    },
    icon: authorizationDenied,
    status: "errorTryAgain"
  }
};

// This fallback is used both for unexpected code and for code that we don't want to map specifically.
const fallbackOutcomeCodes: OutcomeCode = {
  title: {
    "en-EN": "fallback title",
    "it-IT": "Spiacenti, si è verificato un errore imprevisto"
  },
  description: {
    "en-EN": "fallback description",
    "it-IT": "Non è stato addebitato alcun importo."
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
