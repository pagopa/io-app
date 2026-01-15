import _ from "lodash";
import MockDate from "mockdate";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import {
  addFavouriteServiceSuccess,
  removeFavouriteService
} from "../../actions";
import { GlobalState } from "../../../../../../store/reducers/types";
import { createMockService } from "../../../__mocks__";
import { ServiceId } from "../../../../../../../definitions/services/ServiceId";

const mockedDate = Date.now();
MockDate.set(mockedDate);

const mockedServiceId1 = "serviceId1" as ServiceId;
const mockedServiceId2 = "serviceId2" as ServiceId;
const mockedFavouriteService1 = {
  ...createMockService({ id: mockedServiceId1 }),
  addedAt: mockedDate
};
const mockedFavouriteService2 = {
  ...createMockService({ id: mockedServiceId2 }),
  addedAt: mockedDate
};

describe("Favourite services reducer", () => {
  afterEach(() => {
    MockDate.reset();
  });

  it("should have initial state", () => {
    const state = appReducer(undefined, applicationChangeState("active"));
    expect(state.features.services.favouriteServices.dataById).toStrictEqual(
      {}
    );
  });

  it("should handle addFavouriteServiceSuccess action and append the timestamp", () => {
    const state = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, state as any);
    store.dispatch(addFavouriteServiceSuccess(mockedFavouriteService1));

    expect(
      store.getState().features.services.favouriteServices.dataById[
        mockedServiceId1
      ]
    ).toBeDefined();
    expect(
      store.getState().features.services.favouriteServices.dataById
    ).toStrictEqual({
      [mockedServiceId1]: mockedFavouriteService1
    });
  });

  it("should handle removeFavouriteService action", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const finalState = _.merge(undefined, globalState, {
      features: {
        services: {
          favouriteServices: {
            dataById: {
              [mockedServiceId1]: mockedFavouriteService1,
              [mockedServiceId2]: mockedFavouriteService2
            }
          }
        }
      }
    } as unknown as GlobalState);
    const store = createStore(appReducer, finalState as any);

    store.dispatch(
      removeFavouriteService({
        id: mockedServiceId1
      })
    );
    expect(
      store.getState().features.services.favouriteServices.dataById[
        mockedServiceId1
      ]
    ).toBeUndefined();
    expect(
      store.getState().features.services.favouriteServices.dataById[
        mockedServiceId2
      ]
    ).toBeDefined();
  });
});
