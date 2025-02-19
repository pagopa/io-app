import * as pot from "@pagopa/ts-commons/lib/pot";
import { createStore } from "redux";
import { useAutoFetchingServiceByIdPot } from "..";
import { ServiceId } from "../../../../../../definitions/backend/ServiceId";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { MESSAGES_ROUTES } from "../../../../messages/navigation/routes";
import { GlobalState } from "../../../../../store/reducers/types";
import { ServicePublic } from "../../../../../../definitions/backend/ServicePublic";
import { loadServiceDetail } from "../../../../services/details/store/actions/details";

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  ...jest.requireActual<typeof import("react-redux")>("react-redux"),
  useDispatch: () => mockDispatch
}));

// eslint-disable-next-line functional/no-let
let serviceData: pot.Pot<ServicePublic, Error> | undefined;

describe("index", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });
  describe("useAutoFetchingServiceByIdPot", () => {
    const service = {} as ServicePublic;
    [
      pot.none,
      pot.noneLoading,
      pot.noneUpdating(service),
      pot.noneError(Error("")),
      pot.some(service),
      pot.someLoading(service),
      pot.someUpdating(service, service),
      pot.someError(service, Error(""))
    ].forEach(servicePot => {
      const shouldHaveCalledDispatch =
        servicePot.kind === "PotNone" || servicePot.kind === "PotNoneError";
      it(`should ${
        shouldHaveCalledDispatch ? "" : "not "
      }have dispatched 'loadServiceDetail.request' and returned proper data for input pot of type '${
        servicePot.kind
      }'`, () => {
        const serviceId = "01JMESJKA9HS28MEW12P7WPYVC" as ServiceId;

        renderHook(serviceId, servicePot, serviceId);

        expect(serviceData).toEqual(servicePot);
        if (shouldHaveCalledDispatch) {
          expect(mockDispatch.mock.calls.length).toBe(1);
          expect(mockDispatch.mock.calls[0].length).toBe(1);
          expect(mockDispatch.mock.calls[0][0]).toEqual(
            loadServiceDetail.request(serviceId)
          );
        } else {
          expect(mockDispatch.mock.calls.length).toBe(0);
        }
      });
    });
    it(`should have dispatched 'loadServiceDetail.request' and returned proper data for unmatching serviceId`, () => {
      const hookServiceId = "01JMESJKA9HS28MEW12P7WPYVC" as ServiceId;
      renderHook(
        hookServiceId,
        pot.some({} as ServicePublic),
        "8MEW12P7WPYVC01JMESJKA9HS2" as ServiceId
      );

      expect(serviceData).toEqual(pot.none);

      expect(mockDispatch.mock.calls.length).toBe(1);
      expect(mockDispatch.mock.calls[0].length).toBe(1);
      expect(mockDispatch.mock.calls[0][0]).toEqual(
        loadServiceDetail.request(hookServiceId)
      );
    });
  });
});

const renderHook = (
  hookServiceId: ServiceId,
  servicePot: pot.Pot<ServicePublic, Error>,
  storeServiceId: ServiceId
) => {
  const initialState = appReducer(
    {
      features: {
        services: {
          details: {
            byId: {
              [storeServiceId]: servicePot
            }
          }
        }
      }
    } as GlobalState,
    applicationChangeState("active")
  );
  const store = createStore(appReducer, initialState as any);
  return renderScreenWithNavigationStoreContext(
    () => HookWrapper(hookServiceId),
    MESSAGES_ROUTES.MESSAGE_DETAIL,
    {},
    store
  );
};

const HookWrapper = (serviceId: ServiceId) => {
  serviceData = useAutoFetchingServiceByIdPot(serviceId);
  return undefined;
};
