import * as pot from "@pagopa/ts-commons/lib/pot";
import {
  NonEmptyString,
  OrganizationFiscalCode
} from "@pagopa/ts-commons/lib/strings";
import { Tuple2 } from "@pagopa/ts-commons/lib/tuples";
import { Action, createStore } from "redux";
import { ServiceId } from "../../../../../../definitions/backend/ServiceId";
import { ServicePublic } from "../../../../../../definitions/backend/ServicePublic";
import { ServiceScopeEnum } from "../../../../../../definitions/backend/ServiceScope";
import { SpecialServiceCategoryEnum } from "../../../../../../definitions/backend/SpecialServiceCategory";
import { StandardServiceCategoryEnum } from "../../../../../../definitions/backend/StandardServiceCategory";
import { applicationChangeState } from "../../../../../store/actions/application";
import {
  logoutSuccess,
  sessionExpired
} from "../../../../../store/actions/authentication";
import {
  loadServiceDetail,
  removeServiceTuples
} from "../../../../../store/actions/services";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { reproduceSequence } from "../../../../../utils/tests";
import {
  isErrorServiceByIdSelector,
  isLoadingServiceByIdSelector,
  serviceByIdSelector,
  serviceMetadataByIdSelector,
  serviceMetadataInfoSelector
} from "../servicesById";

const serviceId = "serviceId" as ServiceId;

const service = {
  service_id: serviceId,
  service_name: "health",
  organization_name: "Ċentru tas-Saħħa",
  department_name: "covid-19",
  organization_fiscal_code: "FSCLCD" as OrganizationFiscalCode
} as ServicePublic;

describe("serviceById reducer", () => {
  it("should have initial state", () => {
    const state = appReducer(undefined, applicationChangeState("active"));

    expect(state.entities.services.byId).toStrictEqual({});
  });

  it("should handle loadServiceDetail action", () => {
    const state = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, state as any);

    store.dispatch(loadServiceDetail.request(serviceId));

    expect(store.getState().entities.services.byId).toStrictEqual({
      serviceId: pot.noneLoading
    });

    store.dispatch(loadServiceDetail.success(service));
    expect(store.getState().entities.services.byId).toStrictEqual({
      serviceId: pot.some(service)
    });

    const tError = {
      error: new Error("load failed"),
      service_id: serviceId
    };

    store.dispatch(loadServiceDetail.failure(tError));
    expect(store.getState().entities.services.byId).toStrictEqual({
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
    expect(state.entities.services.byId).toEqual({});
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
    expect(state.entities.services.byId).toEqual({});
  });

  it("should handle removeServiceTuples action", () => {
    const sequenceOfActions: ReadonlyArray<Action> = [
      applicationChangeState("active"),
      loadServiceDetail.success({ ...service, service_id: "s1" as ServiceId }),
      loadServiceDetail.success({ ...service, service_id: "s2" as ServiceId }),
      loadServiceDetail.success({ ...service, service_id: "s3" as ServiceId }),
      loadServiceDetail.success({ ...service, service_id: "s4" as ServiceId }),
      loadServiceDetail.success({ ...service, service_id: "s5" as ServiceId }),
      removeServiceTuples([
        Tuple2("s2", "FSCLCD"),
        Tuple2("s3", "FSCLCD"),
        // Not existing serviceId
        Tuple2("s6", "FSCLCD")
      ])
    ];

    const state: GlobalState = reproduceSequence(
      {} as GlobalState,
      appReducer,
      sequenceOfActions
    );

    expect(state.entities.services.byId).toEqual({
      s1: pot.some({ ...service, service_id: "s1" as ServiceId }),
      s4: pot.some({ ...service, service_id: "s4" as ServiceId }),
      s5: pot.some({ ...service, service_id: "s5" as ServiceId })
    });
  });
});

describe("serviceById selectors", () => {
  describe("serviceByIdSelector", () => {
    it("should return the ServicePublic when pot.some", () => {
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
            service_metadata: {
              category: StandardServiceCategoryEnum.STANDARD,
              scope: ServiceScopeEnum.LOCAL
            }
          })
        ),
        serviceId
      );
      expect(serviceById).toStrictEqual({
        category: StandardServiceCategoryEnum.STANDARD,
        scope: ServiceScopeEnum.LOCAL
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
            service_metadata: {
              category: SpecialServiceCategoryEnum.SPECIAL,
              scope: ServiceScopeEnum.NATIONAL,
              custom_special_flow: "custom_special_flow" as NonEmptyString
            }
          })
        ),
        serviceId
      );
      expect(serviceById).toStrictEqual({
        isSpecialService: true,
        customSpecialFlow: "custom_special_flow"
      });
    });

    it("should return undefined when not pot.some and it is not a special service", () => {
      const serviceById = serviceMetadataInfoSelector(
        appReducer({} as GlobalState, loadServiceDetail.success(service)),
        serviceId
      );
      expect(serviceById).toBeUndefined();
    });
  });
});
