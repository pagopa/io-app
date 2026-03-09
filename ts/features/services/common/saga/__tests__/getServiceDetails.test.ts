import * as pot from "@pagopa/ts-commons/lib/pot";
import { testSaga } from "redux-saga-test-plan";
import { ServiceId } from "../../../../../../definitions/backend/ServiceId";
import { ServiceDetails } from "../../../../../../definitions/services/ServiceDetails";
import { loadServiceDetail } from "../../../details/store/actions/details";
import { serviceDetailsByIdPotSelector } from "../../../details/store/selectors";
import { getServiceDetails } from "../getServiceDetails";

describe("getServiceDetails", () => {
  it("when no service is in store, it should dispatch a loadServiceDetail.request and retrieve its result from the store if it succeeds", () => {
    const serviceId = "01J5WS3X839BXX6R1CMM51AB8R" as ServiceId;
    const serviceDetails = { id: serviceId } as ServiceDetails;
    testSaga(getServiceDetails, serviceId)
      .next()
      .select(serviceDetailsByIdPotSelector, serviceId)
      .next(pot.none)
      .put(loadServiceDetail.request(serviceId))
      .next()
      .take([loadServiceDetail.success, loadServiceDetail.failure])
      .next(loadServiceDetail.success(serviceDetails))
      .select(serviceDetailsByIdPotSelector, serviceId)
      .next(pot.some(serviceDetails))
      .returns(serviceDetails);
  });
  it("when an error is in store, it should dispatch a loadServiceDetail.request and retrieve its result from the store if it succeeds", () => {
    const serviceId = "01J5WS3X839BXX6R1CMM51AB8R" as ServiceId;
    const serviceDetails = { id: serviceId } as ServiceDetails;
    testSaga(getServiceDetails, serviceId)
      .next()
      .select(serviceDetailsByIdPotSelector, serviceId)
      .next(pot.noneError)
      .put(loadServiceDetail.request(serviceId))
      .next()
      .take([loadServiceDetail.success, loadServiceDetail.failure])
      .next(loadServiceDetail.success(serviceDetails))
      .select(serviceDetailsByIdPotSelector, serviceId)
      .next(pot.some(serviceDetails))
      .returns(serviceDetails);
  });
  it("when a service with error is in store, it should dispatch a loadServiceDetail.request and retrieve its result from the store if it succeeds", () => {
    const serviceId = "01J5WS3X839BXX6R1CMM51AB8R" as ServiceId;
    const serviceDetails = { id: serviceId } as ServiceDetails;
    testSaga(getServiceDetails, serviceId)
      .next()
      .select(serviceDetailsByIdPotSelector, serviceId)
      .next(pot.someError({}, new Error()))
      .put(loadServiceDetail.request(serviceId))
      .next()
      .take([loadServiceDetail.success, loadServiceDetail.failure])
      .next(loadServiceDetail.success(serviceDetails))
      .select(serviceDetailsByIdPotSelector, serviceId)
      .next(pot.some(serviceDetails))
      .returns(serviceDetails);
  });
  it("when a service is in store, it should return its details", () => {
    const serviceId = "01J5WS3X839BXX6R1CMM51AB8R" as ServiceId;
    const serviceDetails = { id: serviceId } as ServiceDetails;
    testSaga(getServiceDetails, serviceId)
      .next()
      .select(serviceDetailsByIdPotSelector, serviceId)
      .next(pot.some(serviceDetails))
      .returns(serviceDetails);
  });
  it("when no service is in store, it should dispatch a loadServiceDetail.request but return undefined if the related saga fails", () => {
    const serviceId = "01J5WS3X839BXX6R1CMM51AB8R" as ServiceId;
    testSaga(getServiceDetails, serviceId)
      .next()
      .select(serviceDetailsByIdPotSelector, serviceId)
      .next(pot.none)
      .put(loadServiceDetail.request(serviceId))
      .next()
      .take([loadServiceDetail.success, loadServiceDetail.failure])
      .next(
        loadServiceDetail.failure({ service_id: serviceId, error: new Error() })
      )
      .returns(undefined);
  });
});
