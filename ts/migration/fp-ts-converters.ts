import * as E from "fp-ts/lib/Either";
import * as E2 from "fp-ts2/lib/Either";

export const eitherToV2 = <L, A>(e: E.Either<L, A>): E2.Either<L, A> => {
  return e.fold(E2.left, a => E2.of(a));
};
