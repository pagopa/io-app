/**
 * This module implements the sagas to retrive data from the content client:
 */
import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import { BasicResponseType } from "@pagopa/ts-commons/lib/requests";
import * as E from "fp-ts/lib/Either";
import * as t from "io-ts";
import { SagaIterator } from "redux-saga";
import { call, put, takeEvery, takeLatest } from "typed-redux-saga/macro";
import { ActionType, getType } from "typesafe-actions";
import { ContextualHelp } from "../../definitions/content/ContextualHelp";
import { Municipality as MunicipalityMedadata } from "../../definitions/content/Municipality";
import { ContentClient } from "../api/content";
import { loadAvailableBonuses } from "../features/bonus/common/store/actions/availableBonusesTypes";
import {
  contentMunicipalityLoad,
  loadContextualHelpData,
  loadIdps
} from "../store/actions/content";
import { CodiceCatastale } from "../types/MunicipalityCodiceCatastale";
import { ReduxSagaEffect, SagaCallReturnType } from "../types/utils";
import { convertUnknownToError } from "../utils/errors";

const contentClient = ContentClient();

/**
 * Retrieves idps text data from the static content repository
 */
function getContextualHelpData(): Promise<
  t.Validation<BasicResponseType<ContextualHelp>>
> {
  return new Promise((resolve, _) =>
    contentClient
      .getContextualHelp()
      .then(resolve, e => resolve(E.left([{ context: [], value: e }])))
  );
}

/**
 * Retrieves a municipality metadata from the static content repository
 */
function* fetchMunicipalityMetadata(
  getMunicipality: ReturnType<typeof ContentClient>["getMunicipality"],
  codiceCatastale: CodiceCatastale
): Generator<
  ReduxSagaEffect,
  E.Either<Error, MunicipalityMedadata>,
  SagaCallReturnType<typeof getMunicipality>
> {
  try {
    const response: SagaCallReturnType<typeof getMunicipality> = yield* call(
      getMunicipality,
      { codiceCatastale }
    );
    // Can't decode response
    if (E.isLeft(response)) {
      throw Error(readableReport(response.left));
    }
    if (response.right.status !== 200) {
      throw Error(`response status ${response.right.status}`);
    }
    return E.right<Error, MunicipalityMedadata>(response.right.value);
  } catch (error) {
    return E.left<Error, MunicipalityMedadata>(convertUnknownToError(error));
  }
}

/**
 * A saga that watches for and executes requests to load municipality metadata.
 */
function* watchContentMunicipalityLoadSaga(
  action: ActionType<(typeof contentMunicipalityLoad)["request"]>
): SagaIterator {
  const codiceCatastale = action.payload;
  try {
    const response: SagaCallReturnType<typeof fetchMunicipalityMetadata> =
      yield* call(
        fetchMunicipalityMetadata,
        contentClient.getMunicipality,
        codiceCatastale
      );

    if (E.isRight(response)) {
      yield* put(
        contentMunicipalityLoad.success({
          codiceCatastale,
          data: response.right
        })
      );
    } else {
      throw response.left;
    }
  } catch (e) {
    yield* put(
      contentMunicipalityLoad.failure({
        error: convertUnknownToError(e),
        codiceCatastale
      })
    );
  }
}

/**
 * A saga that watches for and executes requests to load contextual help text data
 */
function* watchLoadContextualHelp(): SagaIterator {
  try {
    const response: SagaCallReturnType<typeof getContextualHelpData> =
      yield* call(getContextualHelpData);
    if (E.isRight(response)) {
      if (response.right.status === 200) {
        yield* put(loadContextualHelpData.success(response.right.value));
        return;
      }
      throw Error(`response status ${response.right.status}`);
    }
    throw Error(readableReport(response.left));
  } catch (e) {
    yield* put(loadContextualHelpData.failure(convertUnknownToError(e)));
  }
}

/**
 * A saga that watches for and executes requests to load idps data
 */
function* watchLoadIdps(
  getIdps: ReturnType<typeof ContentClient>["getIdps"]
): SagaIterator {
  try {
    const idpsListResponse: SagaCallReturnType<typeof getIdps> = yield* call(
      getIdps
    );
    if (E.isRight(idpsListResponse)) {
      if (idpsListResponse.right.status === 200) {
        yield* put(loadIdps.success(idpsListResponse.right.value));
        return;
      }
      throw Error(`response status ${idpsListResponse.right.status}`);
    } else {
      throw Error(readableReport(idpsListResponse.left));
    }
  } catch (e) {
    yield* put(loadIdps.failure(convertUnknownToError(e)));
  }
}

// handle available list loading
function* handleLoadAvailableBonus(
  getBonusAvailable: ReturnType<typeof ContentClient>["getBonusAvailable"]
): SagaIterator {
  try {
    const bonusListReponse: SagaCallReturnType<typeof getBonusAvailable> =
      yield* call(getBonusAvailable, {});
    if (E.isRight(bonusListReponse)) {
      if (bonusListReponse.right.status === 200) {
        yield* put(loadAvailableBonuses.success(bonusListReponse.right.value));
        return;
      }
      throw Error(`response status ${bonusListReponse.right.status}`);
    } else {
      throw Error(readableReport(bonusListReponse.left));
    }
  } catch (e) {
    yield* put(loadAvailableBonuses.failure(convertUnknownToError(e)));
  }
}

export function* watchContentSaga() {
  // watch municipality loading request
  yield* takeEvery(
    getType(contentMunicipalityLoad.request),
    watchContentMunicipalityLoadSaga
  );

  // Watch contextual help text data loading request
  yield* takeLatest(
    getType(loadContextualHelpData.request),
    watchLoadContextualHelp
  );

  // Watch idps data loading request
  yield* takeLatest(
    getType(loadIdps.request),
    watchLoadIdps,
    contentClient.getIdps
  );

  // Load content related to the contextual help body
  yield* put(loadContextualHelpData.request());

  // available bonus list request
  yield* takeLatest(
    getType(loadAvailableBonuses.request),
    handleLoadAvailableBonus,
    contentClient.getBonusAvailable
  );
}
