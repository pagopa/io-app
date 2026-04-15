import * as pot from "@pagopa/ts-commons/lib/pot";
import I18n from "i18next";
import { createStore } from "redux";
import _ from "lodash";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { getNetworkError, NetworkError } from "../../../../../utils/errors";
import { FeaturedInstitutionList } from "../FeaturedInstitutionList";
import { Institutions } from "../../../../../../definitions/services/Institutions";
import { OrganizationFiscalCode } from "../../../../../../definitions/services/OrganizationFiscalCode";

const MOCK_FEATURED_INSTITUTIONS: Institutions = {
  institutions: [
    {
      fiscal_code: "FRLFNC82A04D969A" as OrganizationFiscalCode,
      id: "1",
      name: "Institution 1"
    },
    {
      fiscal_code: "FRLFNC82A04D969B" as OrganizationFiscalCode,
      id: "2",
      name: "Institution 2"
    },
    {
      fiscal_code: "FRLFNC82A04D969C" as OrganizationFiscalCode,
      id: "3",
      name: "Institution 3"
    }
  ]
};

jest.mock("../../../../../utils/hooks/useOnFirstRender", () => ({
  useOnFirstRender: jest.fn(() => null)
}));

describe("FeaturedInstitutionList", () => {
  it.each([
    pot.none,
    pot.some({ institutions: [] }) // empty list
  ])(
    "should not render when featuredInstitutions is %s",
    featuredInstitutionsPot => {
      const { queryByText } = renderComponent(featuredInstitutionsPot);
      expect(
        queryByText(I18n.t("services.home.featured.institutions.title"))
      ).toBeNull();
    }
  );

  it.each([pot.noneLoading, pot.someLoading({ institutions: [] })])(
    "should render skeleton when featuredInstitutions is %s",
    featuredInstitutions => {
      const { queryByTestId } = renderComponent(featuredInstitutions);
      expect(
        queryByTestId("featured-institution-list-skeleton")
      ).not.toBeNull();
    }
  );

  it.each([
    pot.some(MOCK_FEATURED_INSTITUTIONS),
    pot.someLoading(MOCK_FEATURED_INSTITUTIONS)
  ])(
    "should render when featuredInstitutions is %s",
    featuredInstitutionsPot => {
      const { queryByTestId } = renderComponent(featuredInstitutionsPot);
      expect(queryByTestId("featured-institution-list")).not.toBeNull();
    }
  );

  it.each([pot.noneError(getNetworkError(new Error("GenericError")))])(
    "should render error banner when featuredInstitutions is %s",
    featuredInstitutionsPot => {
      const { queryByTestId } = renderComponent(featuredInstitutionsPot);
      expect(queryByTestId("featured-institution-list-error")).not.toBeNull();
    }
  );
});

const renderComponent = (
  featuredInstitutions: pot.Pot<Institutions, NetworkError>
) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const finalState = _.merge(undefined, globalState, {
    features: {
      services: {
        home: {
          featuredInstitutions
        }
      }
    }
  } as unknown as GlobalState);
  const store = createStore(appReducer, finalState as any);

  return renderScreenWithNavigationStoreContext(
    () => <FeaturedInstitutionList />,
    "DUMMY",
    {},
    store
  );
};
