import { configure, fetch } from "@react-native-community/netinfo";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { apiUrlPrefix } from "../../../config";

const IO_REACHABIITY_URL = `${apiUrlPrefix}/api/v1/status`;

export const configureNetInfo = () =>
  configure({
    reachabilityUrl: IO_REACHABIITY_URL,
    useNativeReachability: false,
    reachabilityRequestTimeout: 15000,
    reachabilityLongTimeout: 60000,
    reachabilityShortTimeout: 5000
  });

export const fetchNetInfoState = () =>
  pipe(
    TE.tryCatch(
      () => fetch(),
      error => new Error(`Error fetching net info state: ${error}`)
    )
  );
