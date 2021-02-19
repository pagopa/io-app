import * as t from "io-ts";

const LocalizedMessage = t.type({
  "en-EN": t.string,
  "it-IT": t.string
});

const ErrorType = t.keyof({
  blocking: null,
  tryAgain: null
});
const OutcomeCode = t.type({
  title: LocalizedMessage,
  description: LocalizedMessage,
  icon: t.string,
  errorType: ErrorType
});

const OutcomeCodes = t.type({
  "0": OutcomeCode,
  "1": OutcomeCode,
  "2": OutcomeCode
});

export type OutcomeCodes = t.TypeOf<typeof OutcomeCodes>;
export type OutcomeCodesKey = keyof OutcomeCodes;
