import * as E from "fp-ts/lib/Either";
import * as E2 from "fp-ts2/Either";

export const eitherToV2 = <L, A>(e: E.Either<L, A>): E2.Either<L, A> => {
  return e.fold(E2.left, a => E2.of(a));
};

export const eitherToV1 = <L, A>(e: E2.Either<L, A>): E.Either<L, A> => {
  return E2.fold<L, A, E.Either<L, A>>(
    (l: L) => E.left(l),
    (a: A) => E.right(a)
  )(e);
};
