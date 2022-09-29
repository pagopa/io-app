import * as pot from "@pagopa/ts-commons/lib/pot";
import { SagaIterator } from "redux-saga";
import { put, select } from "typed-redux-saga/macro";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import { updateOrganizations } from "../../store/actions/organizations";
import {
  organizationNamesByFiscalCodeSelector,
  OrganizationNamesByFiscalCodeState
} from "../../store/reducers/entities/organizations/organizationsByFiscalCodeReducer";
import {
  visibleServicesSelector,
  VisibleServicesState
} from "../../store/reducers/entities/services/visibleServices";
import { isVisibleService } from "../../utils/services";

/**
 * A function to check if the organization_name included in the service detail is different
 * from the stored organization name (for the same organization_fiscal_code).
 * If true, the incoming one is saved into the redux store.
 * @param service
 */
export function* handleOrganizationNameUpdateSaga(
  service: ServicePublic
): SagaIterator {
  // If the organization fiscal code is associated to different organization names,
  // it is considered valid the one declared for a visible service
  const organizations: OrganizationNamesByFiscalCodeState = yield* select(
    organizationNamesByFiscalCodeSelector
  );
  if (organizations) {
    const fc = service.organization_fiscal_code;

    // The organization is stored if the corresponding fiscal code has no maches among those stored
    const organization = organizations[fc];
    if (!organization) {
      yield* put(updateOrganizations(service));
      return;
    }
    const visibleServices: VisibleServicesState = yield* select(
      visibleServicesSelector
    );
    const isVisible =
      isVisibleService(visibleServices, pot.some(service)) || false;

    // If the organization has been previously saved in the organization entity,
    // the organization name is updated only if the related service is visible
    // and the name has been updated
    if (isVisible && organization !== service.organization_name) {
      yield* put(updateOrganizations(service));
    }
  }
}
