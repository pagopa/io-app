import * as pot from "italia-ts-commons/lib/pot";
import { readableReport } from "italia-ts-commons/lib/reporters";
import { call, Effect, put, select } from "redux-saga/effects";
import { ActionType } from "typesafe-actions";
import { BackendClient } from "../../api/backend";
import { updateOrganizations } from "../../store/actions/organizations";
import { loadServiceContent } from "../../store/actions/services";
import {
  organizationNamesByFiscalCodeSelector,
  OrganizationNamesByFiscalCodeState
} from "../../store/reducers/entities/organizations/organizationsByFiscalCodeReducer";
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
export function* loadServiceContentRequestHandler(
  getService: ReturnType<typeof BackendClient>["getService"],
  action: ActionType<typeof loadServiceContent["request"]>
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
      yield put(loadServiceContent.success(response.value.value));

      // If the organization fiscal code is associated to different organization names,
      // it is considered valid the one declared for a visible service
      const organizations: OrganizationNamesByFiscalCodeState = yield select(
        organizationNamesByFiscalCodeSelector
      );
      if (organizations) {
        const service = pot.some(response.value.value);
        const fc = service.value.organization_fiscal_code;
        const organization = organizations[fc];
        const visibleServices: VisibleServicesState = yield select(
          visibleServicesSelector
        );
        const isVisible = isVisibleService(visibleServices, service) || false;
        // If the organization has been previously saved in the organization entity,
        // the organization name is updated only if the related service is visible
        if (
          !organization ||
          (organization &&
            isVisible &&
            organization !== response.value.value.organization_name)
        ) {
          yield put(updateOrganizations(response.value.value));
        }
      }
    } else {
      throw Error(`response status ${response.value.status}`);
    }
  } catch (error) {
    yield put(
      loadServiceContent.failure({ service_id: action.payload, error })
    );
  }
}
