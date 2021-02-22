import * as t from "io-ts";

const LocalizedMessage = t.type({
  "en-EN": t.string,
  "it-IT": t.string
});

const Status = t.keyof({
  errorBlocking: null,
  errorTryAgain: null,
  success: null
});
const OutcomeCode = t.type({
  title: LocalizedMessage,
  description: LocalizedMessage,
  icon: t.string,
  status: Status
});

const OutcomeCodes = {
  "0": OutcomeCode,
  "1": OutcomeCode,
  "2": OutcomeCode
};

const OutcomeCodesCodec = t.type(OutcomeCodes);

export type OutcomeCode = t.TypeOf<typeof OutcomeCode>;
export type OutcomeCodes = t.TypeOf<typeof OutcomeCodesCodec>;
export const OutcomeCodesKey = t.keyof(OutcomeCodes);
