import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/lib/function";
import { pnAarQRCodeRegexSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import { GlobalState } from "../../../../store/reducers/types";
export const isSendAarLink = (state: GlobalState, url: string) =>
  pipe(
    state,
    pnAarQRCodeRegexSelector,
    O.fromNullable,
    O.map(aarQRCodeRegexString => new RegExp(aarQRCodeRegexString, "i")),
    O.fold(
      () => false,
      regExp => regExp.test(url)
    )
  );
