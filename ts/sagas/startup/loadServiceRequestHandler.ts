import * as pot from "italia-ts-commons/lib/pot";
import { readableReport } from "italia-ts-commons/lib/reporters";
import { call, Effect, put, select } from "redux-saga/effects";
import { ActionType } from "typesafe-actions";
import { BackendClient } from "../../api/backend";
import { contentServiceLoad } from "../../store/actions/content";
import { updateOrganizations } from "../../store/actions/organizations";
import { firstServicesLoad, loadService } from "../../store/actions/services";
import {
  organizationNamesByFiscalCodeSelector,
  OrganizationNamesByFiscalCodeState
} from "../../store/reducers/entities/organizations/organizationsByFiscalCodeReducer";
import { visibleServicesContentLoadStateSelector } from "../../store/reducers/entities/services";
import {
  visibleServicesSelector,
  VisibleServicesState
} from "../../store/reducers/entities/services/visibleServices";
import { SagaCallReturnType } from "../../types/utils";
import { isVisibleService } from "../../utils/services";

/**
 * A generator to load the service details from the Backend
 *
 * @param {function} getService - The function that makes the Backend request
 * @param {string} id - The id of the service to load
 * @returns {IterableIterator<Effect | Either<Error, ServicePublic>>}
 */
export function* loadServiceRequestHandler(
  getService: ReturnType<typeof BackendClient>["getService"],
  action: ActionType<typeof loadService["request"]>
): IterableIterator<Effect> {
  try {
    const response: SagaCallReturnType<typeof getService> = yield call(
      getService,
      { service_id: action.payload }
    );

    if (response.isLeft()) {
      throw Error(readableReport(response.value));
    }

    if (response.value.status === 200) {
      // If the organization fiscal code is associated to different organization names,
      // it is considered valid the one declared for a visible service

      const organizations: OrganizationNamesByFiscalCodeState = yield select(
        organizationNamesByFiscalCodeSelector
      );

      yield put(loadService.success(response.value.value));

      if (organizations) {
        const service = pot.some(response.value.value);
        const fc = service.value.organization_fiscal_code;
        const organization = organizations[fc];
        const visibleServices: VisibleServicesState = yield select(
          visibleServicesSelector
        );
        const isVisible = isVisibleService(visibleServices, service) || false;
        // If the organization has been previously saved in the organization entity,
        // the organization name  is updated only if the related service is visible
        if (
          !organization ||
          (organization &&
            isVisible &&
            organization !== response.value.value.organization_name)
        ) {
          yield put(updateOrganizations(response.value.value));
        }
      }

      // Once the service content is loaded, the service metadata loading is requested.
      // Service metadata contains service scope (national/local) used to identify where
      // the service should be displayed into the ServiceHomeScreen
      yield put(contentServiceLoad.request(response.value.value.service_id));
    } else {
      throw Error();
    }
  } catch (error) {
    yield put(loadService.failure({ service_id: action.payload, error }));
  }

  // If at least one service loading fails, the first services load is considered as failed
  const visibleServicesContentLoadState: pot.Pot<boolean, Error> = yield select(
    visibleServicesContentLoadStateSelector
  );

  if (pot.isError(visibleServicesContentLoadState)) {
    yield put(firstServicesLoad.failure(visibleServicesContentLoadState.error));
  }
}
