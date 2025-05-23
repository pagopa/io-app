import { fetch } from "@react-native-community/netinfo";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";

export const fetchNetInfoState = () =>
  pipe(
    TE.tryCatch(
      () => fetch(),
      error => new Error(`Error fetching net info state: ${error}`)
    )
  );
