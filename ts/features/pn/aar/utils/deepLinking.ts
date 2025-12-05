import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/lib/function";
import { pnAARQRCodeRegexSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import { GlobalState } from "../../../../store/reducers/types";
export const isSendAARLink = (state: GlobalState, url: string) =>
  pipe(
    state,
    pnAARQRCodeRegexSelector,
    O.fromNullable,
    O.map(aarQRCodeRegexString => new RegExp(aarQRCodeRegexString, "i")),
    O.fold(
      () => false,
      regExp => regExp.test(url)
    )
  );
