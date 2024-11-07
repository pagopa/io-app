import * as pot from "@pagopa/ts-commons/lib/pot";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { useAutoFetchingServiceByIdPot } from "..";
import { ServiceId } from "../../../../../../definitions/backend/ServiceId";
import * as serviceSelectors from "../../../../services/details/store/reducers";
import { ServicePublic } from "../../../../../../definitions/backend/ServicePublic";
import { loadServiceDetail } from "../../../../services/details/store/actions/details";

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  ...jest.requireActual<typeof import("react-redux")>("react-redux"),
  useDispatch: () => mockDispatch
}));

describe("useAutoFetchingServiceByIdPot", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });
  const serviceId = "01JA7JWXH7488H8APPYG8JXZXE" as ServiceId;
  const serviceData = {
    service_id: serviceId
  } as ServicePublic;
  [
    pot.none,
    pot.noneLoading,
    pot.noneUpdating(serviceData),
    pot.noneError(Error()),
    pot.some(serviceData),
    pot.someLoading(serviceData),
    pot.someUpdating(serviceData, serviceData),
    pot.someError(serviceData, Error())
  ].forEach(serviceDataPot => {
    const shouldDispatchLoadServiceDetailAction =
      serviceDataPot.kind === "PotNone" ||
      serviceDataPot.kind === "PotNoneError";
    it(`should ${
      shouldDispatchLoadServiceDetailAction ? "   " : "not"
    } dispatch 'loadServiceDetail.request(${serviceId})' and return an instance of ServiceData wrapped in a pot with state '${
      serviceDataPot.kind
    }'`, () => {
      jest
        .spyOn(serviceSelectors, "serviceByIdPotSelector")
        .mockImplementation((_, selectorServiceId) =>
          selectorServiceId === serviceData.service_id
            ? serviceDataPot
            : pot.none
        );

      const hookResult = jest.fn();
      renderComponentWithNavigationContext(serviceId, hookResult);

      if (shouldDispatchLoadServiceDetailAction) {
        expect(mockDispatch.mock.calls.length).toBe(1);
        expect(mockDispatch.mock.calls[0].length).toBe(1);
        expect(mockDispatch.mock.calls[0][0]).toEqual(
          loadServiceDetail.request(serviceId)
        );
      } else {
        expect(mockDispatch.mock.calls.length).toBe(0);
      }

      expect(hookResult.mock.calls.length).toBe(1);
      expect(hookResult.mock.calls[0].length).toBe(1);
      expect(hookResult.mock.calls[0][0]).toEqual(serviceDataPot);
    });
  });
});

const renderComponentWithNavigationContext = (
  serviceId: ServiceId,
  hookResult: (_: pot.Pot<ServicePublic, Error>) => void
) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);

  return renderScreenWithNavigationStoreContext(
    () => {
      const hookOutput = useAutoFetchingServiceByIdPot(serviceId);
      hookResult(hookOutput);
      return undefined;
    },
    "MOCK_ROUTE",
    {},
    store
  );
};
