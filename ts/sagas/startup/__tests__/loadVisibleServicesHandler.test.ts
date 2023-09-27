import * as E from "fp-ts/lib/Either";
import { testSaga } from "redux-saga-test-plan";
import { PaginatedServiceTupleCollection } from "../../../../definitions/backend/PaginatedServiceTupleCollection";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import { loadVisibleServices } from "../../../store/actions/services";
import { loadVisibleServicesRequestHandler } from "../loadVisibleServicesHandler";
import { withRefreshApiCall } from "../../../features/fastLogin/saga/utils";

describe("loadVisibleServicesHandler", () => {
  describe("loadVisibleServicesRequestHandler", () => {
    const getVisibleServices = jest.fn();

    const mockedVisibleServices: PaginatedServiceTupleCollection["items"] = [
      { service_id: "A01" as ServiceId, version: 1 },
      { service_id: "A02" as ServiceId, version: 5 },
      { service_id: "A03" as ServiceId, version: 2 }
    ];

    it("returns a generic error if backend response is 500", () => {
      testSaga(loadVisibleServicesRequestHandler, getVisibleServices)
        .next()
        .call(withRefreshApiCall, getVisibleServices({}))
        .next(
          E.right({
            status: 500,
            value: "An error occurred loading visible services"
          })
        )
        .put(
          loadVisibleServices.failure(
            new Error("An error occurred loading visible services")
          )
        )
        .next()
        .isDone();
    });

    describe("returns an error even if the backend response is 401", () => {
      it("the session expiration is handled by withRefreshApiCall", () => {
        testSaga(loadVisibleServicesRequestHandler, getVisibleServices)
          .next()
          .call(withRefreshApiCall, getVisibleServices({}))
          .next(
            E.right({
              status: 401,
              value: "An error occurred loading visible services"
            })
          )
          .put(
            loadVisibleServices.failure(
              new Error("An error occurred loading visible services")
            )
          )
          .next()
          .isDone();
      });
    });

    it("return an array of visibile services if backend response is 200", () => {
      testSaga(loadVisibleServicesRequestHandler, getVisibleServices)
        .next()
        .call(withRefreshApiCall, getVisibleServices({}))
        .next(E.right({ status: 200, value: { items: mockedVisibleServices } }))
        .put(loadVisibleServices.success(mockedVisibleServices))
        .next();
    });
  });
});
