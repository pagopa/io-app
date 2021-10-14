/**
 * This module implements the sagas to retrive data from the content client:
 */
import { Either, left, right } from "fp-ts/lib/Either";
import * as t from "io-ts";
import { readableReport } from "italia-ts-commons/lib/reporters";
import { BasicResponseType } from "italia-ts-commons/lib/requests";
import { SagaIterator } from "redux-saga";
import { call, Effect, put, takeEvery, takeLatest } from "redux-saga/effects";
import { ActionType, getType } from "typesafe-actions";
import { ContextualHelp } from "../../definitions/content/ContextualHelp";
import { Municipality as MunicipalityMedadata } from "../../definitions/content/Municipality";
import { ContentClient } from "../api/content";
import {
  contentMunicipalityLoad,
  loadContextualHelpData,
  loadIdps
} from "../store/actions/content";
import { CodiceCatastale } from "../types/MunicipalityCodiceCatastale";
import { SagaCallReturnType } from "../types/utils";
import { bonusVacanzeEnabled, bpdEnabled, cgnEnabled } from "../config";
import { loadAvailableBonuses } from "../features/bonus/bonusVacanze/store/actions/bonusVacanze";

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
      .then(resolve, e => resolve(left([{ context: [], value: e }])))
  );
}

/**
 * Retrieves a municipality metadata from the static content repository
 */
function* fetchMunicipalityMetadata(
  getMunicipality: ReturnType<typeof ContentClient>["getMunicipality"],
  codiceCatastale: CodiceCatastale
): Generator<
  Effect,
  Either<Error, MunicipalityMedadata>,
  SagaCallReturnType<typeof getMunicipality>
> {
  try {
    const response: SagaCallReturnType<typeof getMunicipality> = yield call(
      getMunicipality,
      { codiceCatastale }
    );
    // Can't decode response
    if (response.isLeft()) {
      throw Error(readableReport(response.value));
    }
    if (response.value.status !== 200) {
      throw Error(`response status ${response.value.status}`);
    }
    return right<Error, MunicipalityMedadata>(response.value.value);
  } catch (error) {
    return left<Error, MunicipalityMedadata>(error);
  }
}

/**
 * A saga that watches for and executes requests to load municipality metadata.
 */
function* watchContentMunicipalityLoadSaga(
  action: ActionType<typeof contentMunicipalityLoad["request"]>
): SagaIterator {
  const codiceCatastale = action.payload;
  try {
    const response: SagaCallReturnType<typeof fetchMunicipalityMetadata> =
      yield call(
        fetchMunicipalityMetadata,
        contentClient.getMunicipality,
        codiceCatastale
      );

    if (response.isRight()) {
      yield put(
        contentMunicipalityLoad.success({
          codiceCatastale,
          data: response.value
        })
      );
    } else {
      throw response.value;
    }
  } catch (e) {
    yield put(
      contentMunicipalityLoad.failure({
        error: e,
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
      yield call(getContextualHelpData);
    if (response.isRight()) {
      if (response.value.status === 200) {
        yield put(loadContextualHelpData.success(response.value.value));
        return;
      }
      throw Error(`response status ${response.value.status}`);
    }
    throw Error(readableReport(response.value));
  } catch (e) {
    yield put(loadContextualHelpData.failure(e));
  }
}

/**
 * A saga that watches for and executes requests to load idps data
 */
function* watchLoadIdps(
  getIdps: ReturnType<typeof ContentClient>["getIdps"]
): SagaIterator {
  try {
    const idpsListResponse: SagaCallReturnType<typeof getIdps> = yield call(
      getIdps
    );
    if (idpsListResponse.isRight()) {
      if (idpsListResponse.value.status === 200) {
        yield put(loadIdps.success(idpsListResponse.value.value));
        return;
      }
      throw Error(`response status ${idpsListResponse.value.status}`);
    } else {
      throw Error(readableReport(idpsListResponse.value));
    }
  } catch (e) {
    yield put(loadIdps.failure(e));
  }
}

// handle available list loading
function* handleLoadAvailableBonus(
  getBonusAvailable: ReturnType<typeof ContentClient>["getBonusAvailable"]
): SagaIterator {
  try {
    const bonusListReponse: SagaCallReturnType<typeof getBonusAvailable> =
      yield call(getBonusAvailable, {});
    if (bonusListReponse.isRight()) {
      if (bonusListReponse.value.status === 200) {
        yield put(loadAvailableBonuses.success(bonusListReponse.value.value));
        return;
      }
      throw Error(`response status ${bonusListReponse.value.status}`);
    } else {
      throw Error(readableReport(bonusListReponse.value));
    }
  } catch (e) {
    yield put(loadAvailableBonuses.failure(e));
  }
}

export function* watchContentSaga() {
  // watch municipality loading request
  yield takeEvery(
    getType(contentMunicipalityLoad.request),
    watchContentMunicipalityLoadSaga
  );

  // Watch contextual help text data loading request
  yield takeLatest(
    getType(loadContextualHelpData.request),
    watchLoadContextualHelp
  );

  // Watch idps data loading request
  yield takeLatest(
    getType(loadIdps.request),
    watchLoadIdps,
    contentClient.getIdps
  );

  // Load content related to the contextual help body
  yield put(loadContextualHelpData.request());

  if (bonusVacanzeEnabled || bpdEnabled || cgnEnabled) {
    // available bonus list request
    yield takeLatest(
      getType(loadAvailableBonuses.request),
      handleLoadAvailableBonus,
      contentClient.getBonusAvailable
    );
  }
}
