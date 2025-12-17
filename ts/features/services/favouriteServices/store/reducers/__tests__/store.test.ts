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
import { createMockFavouriteService } from "../../../__mocks__";
import { ServiceId } from "../../../../../../../definitions/services/ServiceId";

const SERVICE_ID_1 = "serviceId1" as ServiceId;
const SERVICE_ID_2 = "serviceId2" as ServiceId;
const FAVOURITE_SERVICE_1 = createMockFavouriteService({ id: SERVICE_ID_1 });
const FAVOURITE_SERVICE_2 = createMockFavouriteService({ id: SERVICE_ID_2 });

const MOCKED_DATE = Date.now();
MockDate.set(MOCKED_DATE);

describe("Favourite services reducer", () => {
  it("should have initial state", () => {
    const state = appReducer(undefined, applicationChangeState("active"));
    expect(state.features.services.favouriteServices.dataById).toStrictEqual(
      {}
    );
  });

  it("should handle addFavouriteServiceSuccess action and append the timestamp", () => {
    const state = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, state as any);
    store.dispatch(addFavouriteServiceSuccess(FAVOURITE_SERVICE_1));

    expect(
      store.getState().features.services.favouriteServices.dataById[
        SERVICE_ID_1
      ]
    ).toBeDefined();
    expect(
      store.getState().features.services.favouriteServices.dataById
    ).toStrictEqual({
      [SERVICE_ID_1]: {
        ...FAVOURITE_SERVICE_1,
        addedAt: MOCKED_DATE
      }
    });
  });

  it("should handle removeFavouriteService action", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const finalState = _.merge(undefined, globalState, {
      features: {
        services: {
          favouriteServices: {
            dataById: {
              [SERVICE_ID_1]: {
                ...FAVOURITE_SERVICE_1,
                addedAt: MOCKED_DATE
              },
              [SERVICE_ID_2]: {
                ...FAVOURITE_SERVICE_2,
                addedAt: MOCKED_DATE
              }
            }
          }
        }
      }
    } as unknown as GlobalState);
    const store = createStore(appReducer, finalState as any);

    store.dispatch(
      removeFavouriteService({
        id: SERVICE_ID_1
      })
    );
    expect(
      store.getState().features.services.favouriteServices.dataById[
        SERVICE_ID_1
      ]
    ).toBeUndefined();
    expect(
      store.getState().features.services.favouriteServices.dataById[
        SERVICE_ID_2
      ]
    ).toBeDefined();
  });
});
