import { SagaIterator } from "redux-saga";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { FciClient } from "../../api/backendFci";
import {
  fciEnvironmentSet,
  fciSignatureRequestFromId
} from "../../store/actions";
import { getNetworkError } from "../../../../utils/errors";
import { SessionToken } from "../../../../types/SessionToken";
import { SagaCallReturnType } from "../../../../types/utils";
import { withRefreshApiCall } from "../../../fastLogin/saga/utils";
import {
  Environment,
  EnvironmentEnum
} from "../../../../../definitions/fci/Environment";

/*
 * A saga to load a FCI signature request.
 */
export function* handleGetSignatureRequestById(
  getSignatureRequestById: FciClient["getSignatureRequestById"],
  bearerToken: SessionToken,
  action: ActionType<(typeof fciSignatureRequestFromId)["request"]>
): SagaIterator {
  try {
    const getSignatureDetailByIdRequest = getSignatureRequestById({
      id: action.payload,
      Bearer: `Bearer ${bearerToken}`
    });

    const getSignatureDetailViewByIdResponse = (yield* call(
      withRefreshApiCall,
      getSignatureDetailByIdRequest,
      action
    )) as unknown as SagaCallReturnType<typeof getSignatureRequestById>;

    if (E.isLeft(getSignatureDetailViewByIdResponse)) {
      throw Error(
        readablePrivacyReport(getSignatureDetailViewByIdResponse.left)
      );
    }

    if (getSignatureDetailViewByIdResponse.right.status === 200) {
      /**
       * Get the environment from the response header with default prod value.
       */
      const env = pipe(
        Environment.decode(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          getSignatureDetailViewByIdResponse.right.headers.get(
            "x-io-sign-environment"
          )
        ),
        E.getOrElse(() => EnvironmentEnum.prod)
      );

      yield* put(
        fciSignatureRequestFromId.success(
          getSignatureDetailViewByIdResponse.right.value
        )
      );

      yield* put(fciEnvironmentSet(env));
      return;
    }

    if (getSignatureDetailViewByIdResponse.right.status === 401) {
      return;
    }

    throw Error(
      `${JSON.stringify(getSignatureDetailViewByIdResponse.right.value)}`
    );
  } catch (e) {
    yield* put(fciSignatureRequestFromId.failure(getNetworkError(e)));
  }
}
