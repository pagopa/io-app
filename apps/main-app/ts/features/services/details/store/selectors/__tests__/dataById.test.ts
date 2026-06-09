import {
  NonEmptyString,
  OrganizationFiscalCode
} from "@pagopa/ts-commons/lib/strings";
import { Action } from "redux";
import { ServiceId } from "../../../../../../../definitions/services/ServiceId";
import { ServiceDetails } from "../../../../../../../definitions/services/ServiceDetails";
import { StandardServiceCategoryEnum } from "../../../../../../../definitions/services/StandardServiceCategory";
import { ScopeTypeEnum } from "../../../../../../../definitions/services/ScopeType";
import { SpecialServiceCategoryEnum } from "../../../../../../../definitions/services/SpecialServiceCategory";
import { loadServiceDetail } from "../../actions/details";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import {
  isErrorServiceDetailsByIdSelector,
  isLoadingServiceDetailsByIdSelector,
  serviceDetailsByIdSelector,
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

describe("dataById selectors", () => {
  describe("serviceByIdSelector", () => {
    it("should return the ServiceDetails when pot.some", () => {
      const serviceById = serviceDetailsByIdSelector(
        appReducer({} as GlobalState, loadServiceDetail.success(service)),
        serviceId
      );
      expect(serviceById).toStrictEqual(service);
    });

    it("should return undefined when not pot.some", () => {
      expect(
        serviceDetailsByIdSelector(
          appReducer(undefined, {} as Action),
          serviceId
        )
      ).toBeUndefined();

      expect(
        serviceDetailsByIdSelector(
          appReducer({} as GlobalState, loadServiceDetail.request(serviceId)),
          serviceId
        )
      ).toBeUndefined();

      const tError = {
        error: new Error("error"),
        service_id: serviceId
      };

      expect(
        serviceDetailsByIdSelector(
          appReducer({} as GlobalState, loadServiceDetail.failure(tError)),
          serviceId
        )
      ).toBeUndefined();
    });
  });

  describe("isLoadingServiceByIdSelector", () => {
    it("should return true when pot.loading", () => {
      const isLoadingServiceById = isLoadingServiceDetailsByIdSelector(
        appReducer({} as GlobalState, loadServiceDetail.request(serviceId)),
        serviceId
      );
      expect(isLoadingServiceById).toStrictEqual(true);
    });

    it("should return false when not pot.some", () => {
      expect(
        isLoadingServiceDetailsByIdSelector(
          appReducer(undefined, {} as Action),
          serviceId
        )
      ).toStrictEqual(false);

      expect(
        isLoadingServiceDetailsByIdSelector(
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

      const isErrorServiceById = isErrorServiceDetailsByIdSelector(
        appReducer({} as GlobalState, loadServiceDetail.failure(tError)),
        serviceId
      );
      expect(isErrorServiceById).toStrictEqual(true);
    });

    it("should return false when not pot.error", () => {
      expect(
        isErrorServiceDetailsByIdSelector(
          appReducer(undefined, {} as Action),
          serviceId
        )
      ).toStrictEqual(false);

      expect(
        isErrorServiceDetailsByIdSelector(
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
