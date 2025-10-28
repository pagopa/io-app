import * as E from "fp-ts/lib/Either";
import { testSaga } from "redux-saga-test-plan";
import { getType } from "typesafe-actions";
import { ServiceId } from "../../../../../../definitions/services/ServiceId";
import { withRefreshApiCall } from "../../../../authentication/fastLogin/saga/utils";
import {
  getFavouriteService,
  toggleFavouriteService
} from "../../store/actions/favourite";
import {
  handleGetFavouriteService,
  handleToggleFavouriteService
} from "../handleFavouriteService";
import { ServicesClient } from "../../../common/api/__mocks__/client";
import { getNetworkError } from "../../../../../utils/errors";

const mockedServiceId = "serviceId" as ServiceId;

describe("handleFavouriteService", () => {
  it(`should put ${getType(
    getFavouriteService.success
  )} when getUserFavouriteService is 200`, () => {
    testSaga(
      handleGetFavouriteService,
      ServicesClient.getUserFavouriteService,
      getFavouriteService.request(mockedServiceId)
    )
      .next()
      .call(
        withRefreshApiCall,
        ServicesClient.getUserFavouriteService({ serviceId: mockedServiceId })
      )
      .next(E.right({ status: 200 }))
      .put(getFavouriteService.success(mockedServiceId))
      .next()
      .isDone();
  });

  it(`should put ${getType(
    getFavouriteService.failure
  )} when getUserFavouriteService is not 200`, () => {
    testSaga(
      handleGetFavouriteService,
      ServicesClient.getUserFavouriteService,
      getFavouriteService.request(mockedServiceId)
    )
      .next()
      .call(
        withRefreshApiCall,
        ServicesClient.getUserFavouriteService({ service_id: mockedServiceId })
      )
      .next(E.right({ status: 500, value: "generic error" }))
      .put(
        getFavouriteService.failure({
          id: mockedServiceId,
          error: getNetworkError(new Error(`response status code 500`))
        })
      )
      .next()
      .isDone();
  });

  it(`should put ${getType(
    toggleFavouriteService.success
  )} when setUserFavouriteService is 200`, () => {
    testSaga(
      handleToggleFavouriteService,
      ServicesClient.setUserFavouriteService,
      toggleFavouriteService.request({ id: mockedServiceId, isFavourite: true })
    )
      .next()
      .call(
        withRefreshApiCall,
        ServicesClient.setUserFavouriteService({ serviceId: mockedServiceId })
      )
      .next(E.right({ status: 204 }))
      .put(
        toggleFavouriteService.success({
          id: mockedServiceId,
          isFavourite: true
        })
      )
      .next()
      .isDone();
  });

  it(`should put ${getType(
    toggleFavouriteService.failure
  )} when setUserFavouriteService is not 200`, () => {
    testSaga(
      handleToggleFavouriteService,
      ServicesClient.setUserFavouriteService,
      toggleFavouriteService.request({ id: mockedServiceId, isFavourite: true })
    )
      .next()
      .call(
        withRefreshApiCall,
        ServicesClient.getUserFavouriteService({ service_id: mockedServiceId })
      )
      .next(E.right({ status: 500, value: "generic error" }))
      .put(
        toggleFavouriteService.failure({
          id: mockedServiceId,
          isFavourite: false,
          error: getNetworkError(new Error(`response status code 500`))
        })
      )
      .next()
      .isDone();
  });

  it(`should put ${getType(
    toggleFavouriteService.success
  )} when removeUserFavouriteService is 200`, () => {
    testSaga(
      handleToggleFavouriteService,
      ServicesClient.removeUserFavouriteService,
      toggleFavouriteService.request({
        id: mockedServiceId,
        isFavourite: false
      })
    )
      .next()
      .call(
        withRefreshApiCall,
        ServicesClient.removeUserFavouriteService({
          serviceId: mockedServiceId
        })
      )
      .next(E.right({ status: 204 }))
      .put(
        toggleFavouriteService.success({
          id: mockedServiceId,
          isFavourite: false
        })
      )
      .next()
      .isDone();
  });

  it(`should put ${getType(
    toggleFavouriteService.failure
  )} when removeUserFavouriteService is not 200`, () => {
    testSaga(
      handleToggleFavouriteService,
      ServicesClient.removeUserFavouriteService,
      toggleFavouriteService.request({
        id: mockedServiceId,
        isFavourite: false
      })
    )
      .next()
      .call(
        withRefreshApiCall,
        ServicesClient.removeUserFavouriteService({
          service_id: mockedServiceId
        })
      )
      .next(E.right({ status: 500, value: "generic error" }))
      .put(
        toggleFavouriteService.failure({
          id: mockedServiceId,
          isFavourite: true,
          error: getNetworkError(new Error(`response status code 500`))
        })
      )
      .next()
      .isDone();
  });
});
