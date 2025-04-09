import * as pot from "@pagopa/ts-commons/lib/pot";
import {
  NonEmptyString,
  OrganizationFiscalCode
} from "@pagopa/ts-commons/lib/strings";
import { Action, createStore } from "redux";
import { ServiceId } from "../../../../../../../definitions/services/ServiceId";
import { ServiceDetails } from "../../../../../../../definitions/services/ServiceDetails";
import { StandardServiceCategoryEnum } from "../../../../../../../definitions/services/StandardServiceCategory";
import { ScopeTypeEnum } from "../../../../../../../definitions/services/ScopeType";
import { SpecialServiceCategoryEnum } from "../../../../../../../definitions/services/SpecialServiceCategory";
import { applicationChangeState } from "../../../../../../store/actions/application";
import {
  logoutSuccess,
  sessionExpired
} from "../../../../../authentication/common/store/actions";
import { loadServiceDetail } from "../../actions/details";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import { reproduceSequence } from "../../../../../../utils/tests";
import {
  isErrorServiceByIdSelector,
  isLoadingServiceByIdSelector,
  serviceByIdSelector,
  serviceMetadataByIdSelector,
  serviceMetadataInfoSelector
} from "..";

const serviceId = "serviceId" as ServiceId;

const service = {
  id: serviceId,
  name: "name",
  organization: {
    fiscal_code: "FSCLCD" as OrganizationFiscalCode,
    name: "Ċentru tas-Saħħa"
  }
} as ServiceDetails;

describe("serviceById reducer", () => {
  it("should have initial state", () => {
    const state = appReducer(undefined, applicationChangeState("active"));

    expect(state.features.services.details.byId).toStrictEqual({});
  });

  it("should handle loadServiceDetail action", () => {
    const state = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, state as any);

    store.dispatch(loadServiceDetail.request(serviceId));

    expect(store.getState().features.services.details.byId).toStrictEqual({
      serviceId: pot.noneLoading
    });

    store.dispatch(loadServiceDetail.success(service));
    expect(store.getState().features.services.details.byId).toStrictEqual({
      serviceId: pot.some(service)
    });

    const tError = {
      error: new Error("load failed"),
      service_id: serviceId
    };

    store.dispatch(loadServiceDetail.failure(tError));
    expect(store.getState().features.services.details.byId).toStrictEqual({
      serviceId: pot.someError(service, new Error("load failed"))
    });
  });

  it("should handle logoutSuccess action", () => {
    const sequenceOfActions: ReadonlyArray<Action> = [
      applicationChangeState("active"),
      loadServiceDetail.success(service),
      logoutSuccess()
    ];

    const state: GlobalState = reproduceSequence(
      {} as GlobalState,
      appReducer,
      sequenceOfActions
    );
    expect(state.features.services.details.byId).toEqual({});
  });

  it("should handle sessionExpired action", () => {
    const sequenceOfActions: ReadonlyArray<Action> = [
      applicationChangeState("active"),
      loadServiceDetail.success(service),
      sessionExpired()
    ];

    const state: GlobalState = reproduceSequence(
      {} as GlobalState,
      appReducer,
      sequenceOfActions
    );
    expect(state.features.services.details.byId).toEqual({});
  });
});

describe("serviceById selectors", () => {
  describe("serviceByIdSelector", () => {
    it("should return the ServiceDetails when pot.some", () => {
      const serviceById = serviceByIdSelector(
        appReducer({} as GlobalState, loadServiceDetail.success(service)),
        serviceId
      );
      expect(serviceById).toStrictEqual(service);
    });

    it("should return undefined when not pot.some", () => {
      expect(
        serviceByIdSelector(appReducer(undefined, {} as Action), serviceId)
      ).toBeUndefined();

      expect(
        serviceByIdSelector(
          appReducer({} as GlobalState, loadServiceDetail.request(serviceId)),
          serviceId
        )
      ).toBeUndefined();

      const tError = {
        error: new Error("error"),
        service_id: serviceId
      };

      expect(
        serviceByIdSelector(
          appReducer({} as GlobalState, loadServiceDetail.failure(tError)),
          serviceId
        )
      ).toBeUndefined();
    });
  });

  describe("isLoadingServiceByIdSelector", () => {
    it("should return true when pot.loading", () => {
      const isLoadingServiceById = isLoadingServiceByIdSelector(
        appReducer({} as GlobalState, loadServiceDetail.request(serviceId)),
        serviceId
      );
      expect(isLoadingServiceById).toStrictEqual(true);
    });

    it("should return false when not pot.some", () => {
      expect(
        isLoadingServiceByIdSelector(
          appReducer(undefined, {} as Action),
          serviceId
        )
      ).toStrictEqual(false);

      expect(
        isLoadingServiceByIdSelector(
          appReducer({} as GlobalState, loadServiceDetail.success(service)),
          serviceId
        )
      ).toStrictEqual(false);
    });
  });

  describe("isErrorServiceByIdSelector", () => {
    it("should return true when pot.error", () => {
      const tError = {
        error: new Error("error"),
        service_id: serviceId
      };

      const isErrorServiceById = isErrorServiceByIdSelector(
        appReducer({} as GlobalState, loadServiceDetail.failure(tError)),
        serviceId
      );
      expect(isErrorServiceById).toStrictEqual(true);
    });

    it("should return false when not pot.error", () => {
      expect(
        isErrorServiceByIdSelector(
          appReducer(undefined, {} as Action),
          serviceId
        )
      ).toStrictEqual(false);

      expect(
        isErrorServiceByIdSelector(
          appReducer({} as GlobalState, loadServiceDetail.success(service)),
          serviceId
        )
      ).toStrictEqual(false);
    });
  });

  describe("serviceMetadataByIdSelector", () => {
    it("should return ServiceMetadata when pot.some and service_metadata defined", () => {
      const serviceById = serviceMetadataByIdSelector(
        appReducer(
          {} as GlobalState,
          loadServiceDetail.success({
            ...service,
            metadata: {
              category: StandardServiceCategoryEnum.STANDARD,
              scope: ScopeTypeEnum.LOCAL
            }
          })
        ),
        serviceId
      );
      expect(serviceById).toStrictEqual({
        category: StandardServiceCategoryEnum.STANDARD,
        scope: ScopeTypeEnum.LOCAL
      });
    });

    it("should return undefined when pot.some and service_metadata not defined", () => {
      const serviceById = serviceMetadataByIdSelector(
        appReducer({} as GlobalState, loadServiceDetail.success(service)),
        serviceId
      );
      expect(serviceById).toBeUndefined();
    });

    it("should return undefined when not pot.some", () => {
      expect(
        serviceMetadataByIdSelector(
          appReducer(undefined, {} as Action),
          serviceId
        )
      ).toBeUndefined();

      expect(
        serviceMetadataByIdSelector(
          appReducer({} as GlobalState, loadServiceDetail.request(serviceId)),
          serviceId
        )
      ).toBeUndefined();

      const tError = {
        error: new Error("error"),
        service_id: serviceId
      };

      expect(
        serviceMetadataByIdSelector(
          appReducer({} as GlobalState, loadServiceDetail.failure(tError)),
          serviceId
        )
      ).toBeUndefined();
    });
  });

  describe("serviceMetadataInfoSelector", () => {
    it("should return serviceMetadataInfo when pot.some and it is a special service", () => {
      const serviceById = serviceMetadataInfoSelector(
        appReducer(
          {} as GlobalState,
          loadServiceDetail.success({
            ...service,
            metadata: {
              category: SpecialServiceCategoryEnum.SPECIAL,
              scope: ScopeTypeEnum.NATIONAL,
              custom_special_flow: "pn" as NonEmptyString
            }
          })
        ),
        serviceId
      );
      expect(serviceById).toStrictEqual({
        isSpecialService: true,
        serviceKind: "pn"
      });
    });

    it("should return undefined when not pot.some and it is not a special service", () => {
      const serviceById = serviceMetadataInfoSelector(
        appReducer({} as GlobalState, loadServiceDetail.success(service)),
        serviceId
      );
      expect(serviceById).toStrictEqual({
        isSpecialService: false
      });
    });
  });
});
