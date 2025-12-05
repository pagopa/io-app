import _ from "lodash";
import { createStore } from "redux";
import I18n from "i18next";
import { OrganizationFiscalCode } from "@pagopa/ts-commons/lib/strings";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { FavouriteServiceButton } from "../FavouriteServiceButton";

import * as selectors from "../../../common/store/selectors/remoteConfig";
import { ServiceDetails } from "../../../../../../definitions/services/ServiceDetails";
import { ServiceId } from "../../../../../../definitions/services/ServiceId";
import { FavouriteServiceType } from "../../../favouriteServices/types";

const serviceId = "serviceCgn" as ServiceId;

const mockService = {
  id: serviceId,
  name: "serviceName",
  organization: {
    fiscal_code: "fiscalCode" as OrganizationFiscalCode,
    name: "name"
  }
} as ServiceDetails;

const mockFavouriteService = {
  id: serviceId,
  institution: {
    fiscal_code: "fiscalCode" as OrganizationFiscalCode,
    name: "name"
  },
  name: "serviceName",
  addedAt: new Date().toISOString()
} as FavouriteServiceType;

describe("FavouriteServiceButton", () => {
  it("should NOT render if the feature is disabled", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));

    jest
      .spyOn(selectors, "isFavouriteServicesEnabledSelector")
      .mockReturnValue(false);

    const { queryByText } = renderComponent(globalState);
    expect(queryByText(I18n.t("services.favouriteServices.add"))).toBeNull();
    expect(queryByText(I18n.t("services.favouriteServices.remove"))).toBeNull();
  });

  it("should render the 'Remove' button if service IS favourite", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const state = _.merge(undefined, globalState, {
      features: {
        services: {
          favouriteServices: {
            dataById: {
              [serviceId]: mockFavouriteService
            }
          }
        }
      }
    } as GlobalState);

    jest
      .spyOn(selectors, "isFavouriteServicesEnabledSelector")
      .mockReturnValue(true);

    const { getByText } = renderComponent(state);
    expect(getByText(I18n.t("services.favouriteServices.remove"))).toBeTruthy();
  });

  it("should render the 'Add' button if service is NOT favourite", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const state = _.merge(undefined, globalState, {
      features: {
        services: {
          favouriteServices: {
            dataById: {}
          }
        }
      }
    } as GlobalState);

    jest
      .spyOn(selectors, "isFavouriteServicesEnabledSelector")
      .mockReturnValue(true);

    const { getByText } = renderComponent(state);
    expect(getByText(I18n.t("services.favouriteServices.add"))).toBeTruthy();
  });
});

const renderComponent = (state: GlobalState) => {
  const store = createStore(appReducer, state as any);

  // Aggiornare anche lo store

  return renderScreenWithNavigationStoreContext(
    () => <FavouriteServiceButton service={mockService} />,
    "DUMMY",
    {},
    store
  );
};
