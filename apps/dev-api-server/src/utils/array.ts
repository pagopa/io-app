import * as E from "fp-ts/lib/Either";
import { NonEmptyArray } from "fp-ts/lib/NonEmptyArray";

export const eitherMakeBy = <E, A>(
  n: number,
  f: (i: number) => E.Either<E, A>
): E.Either<E, Array<A>> => (n <= 0 ? E.right([]) : eitherNEAMakeBy(f)(n));
export const eitherNEAMakeBy =
  <E, A>(f: (i: number) => E.Either<E, A>) =>
  (n: number): E.Either<E, NonEmptyArray<A>> => {
    const j = Math.max(0, Math.floor(n));
    const result = f(0);
    if (E.isLeft(result)) {
      return result;
    }
    const out: NonEmptyArray<A> = [result.right];
    // eslint-disable-next-line functional/no-let
    for (let i = 1; i < j; i++) {
      const result = f(i);
      if (E.isLeft(result)) {
        return result;
      }
      out.push(result.right);
    }
    return E.right(out);
  };
