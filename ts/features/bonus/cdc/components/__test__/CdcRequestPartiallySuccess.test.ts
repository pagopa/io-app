import { createStore, Store } from "redux";
import { fireEvent } from "@testing-library/react-native";
import { appReducer } from "../../../../../store/reducers";
import { applicationChangeState } from "../../../../../store/actions/application";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenFakeNavRedux } from "../../../../../utils/testWrapper";
import ROUTES from "../../../../../navigation/routes";
import I18n from "../../../../../i18n";
import CdcRequestPartiallySuccess from "../CdcRequestPartiallySuccess";
import { cdcEnrollUserToBonus } from "../../store/actions/cdcBonusRequest";
import { Anno } from "../../../../../../definitions/cdc/Anno";
import {
  CdcBonusEnrollmentOutcomeList,
  RequestOutcomeEnum
} from "../../types/CdcBonusRequest";

jest.useFakeTimers();

const mockedNavigation = jest.fn();

jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native");
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: actualNav,
      dispatch: jest.fn(),
      getParent: () => ({
        goBack: mockedNavigation
      }),
      addListener: () => jest.fn()
    })
  };
});

const mockedMixedBonusResponse: CdcBonusEnrollmentOutcomeList = [
  { year: "2018" as Anno, outcome: RequestOutcomeEnum.OK },
  {
    year: "2019" as Anno,
    outcome: RequestOutcomeEnum.RESIDENCE_ABROAD
  },
  {
    year: "2020" as Anno,
    outcome: RequestOutcomeEnum.CIT_REGISTRATO
  },
  {
    year: "2021" as Anno,
    outcome: RequestOutcomeEnum.ANNO_NON_AMMISSIBILE
  },
  {
    year: "2022" as Anno,
    outcome: RequestOutcomeEnum.INIZIATIVA_TERMINATA
  }
];
describe("CdcRequestPartiallySuccess", () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  describe("when the cdcEnrollUserToBonus is ready and the kind is partialSuccess", () => {
    it("should show the CdcRequestPartiallySuccess screen with the title, the body and the button", () => {
      const store: Store<GlobalState> = createStore(
        appReducer,
        globalState as any
      );

      store.dispatch(
        cdcEnrollUserToBonus.success({
          kind: "partialSuccess",
          value: mockedMixedBonusResponse
        })
      );
      const component = renderComponent(store);

      const expectedBody = `${I18n.t(
        "bonus.cdc.bonusRequest.bonusRequested.partiallySuccess.body.success",
        { successfulYears: "2018" }
      )} ${I18n.t(
        "bonus.cdc.bonusRequest.bonusRequested.partiallySuccess.body.fail.initiativeFinished",
        { failedYears: "2022" }
      )} ${I18n.t(
        "bonus.cdc.bonusRequest.bonusRequested.partiallySuccess.body.fail.alreadyRegistered",
        { failedYears: "2020" }
      )} ${I18n.t(
        "bonus.cdc.bonusRequest.bonusRequested.partiallySuccess.body.fail.notEligible",
        { failedYears: "2021" }
      )} ${I18n.t(
        "bonus.cdc.bonusRequest.bonusRequested.partiallySuccess.body.fail.residenceAbroad",
        { failedYears: "2019" }
      )} `;

      expect(component.getByTestId("cdcRequestPartiallySuccess")).toBeDefined();

      expect(
        component.getByText(
          I18n.t("bonus.cdc.bonusRequest.bonusRequested.partiallySuccess.title")
        )
      ).toBeDefined();
      expect(component.getByText(expectedBody)).toBeDefined();

      expect(component.getByTestId("closeButton")).toBeDefined();
    });
    it("should show the separator if more then one year has the same outcome", () => {
      const store: Store<GlobalState> = createStore(
        appReducer,
        globalState as any
      );

      store.dispatch(
        cdcEnrollUserToBonus.success({
          kind: "partialSuccess",
          value: [
            { ...mockedMixedBonusResponse[0] },
            { ...mockedMixedBonusResponse[0], year: "2020" as Anno },
            { ...mockedMixedBonusResponse[1] },
            { ...mockedMixedBonusResponse[1], year: "2021" as Anno }
          ]
        })
      );
      const component = renderComponent(store);

      const expectedBody = `${I18n.t(
        "bonus.cdc.bonusRequest.bonusRequested.partiallySuccess.body.success",
        {
          successfulYears: ["2018", "2020"].join(
            I18n.t("bonus.cdc.bonusRequest.misc.conjunction")
          )
        }
      )} ${I18n.t(
        "bonus.cdc.bonusRequest.bonusRequested.partiallySuccess.body.fail.residenceAbroad",
        {
          failedYears: ["2019", "2021"].join(
            I18n.t("bonus.cdc.bonusRequest.misc.conjunction")
          )
        }
      )} `;

      expect(component.getByTestId("cdcRequestPartiallySuccess")).toBeDefined();

      expect(component.getByText(expectedBody)).toBeDefined();
    });
    it("should not show a body row if the problem is not present in the response", () => {
      const store: Store<GlobalState> = createStore(
        appReducer,
        globalState as any
      );

      store.dispatch(
        cdcEnrollUserToBonus.success({
          kind: "partialSuccess",
          value: [mockedMixedBonusResponse[0]]
        })
      );
      const component = renderComponent(store);
      expect(
        component.getByText(
          `${I18n.t(
            "bonus.cdc.bonusRequest.bonusRequested.partiallySuccess.body.success",
            { successfulYears: "2018" }
          )} `
        )
      ).toBeDefined();
      expect(
        component.queryByText(
          `${I18n.t(
            "bonus.cdc.bonusRequest.bonusRequested.partiallySuccess.body.fail.initiativeFinished",
            { failedYears: "2022" }
          )}`
        )
      ).toBeNull();
    });
    it("should be called a navigation back when the button is pressed", () => {
      const store: Store<GlobalState> = createStore(
        appReducer,
        globalState as any
      );

      store.dispatch(
        cdcEnrollUserToBonus.success({
          kind: "partialSuccess",
          value: mockedMixedBonusResponse
        })
      );
      const component = renderComponent(store);
      const button = component.getByTestId("closeButton");
      fireEvent(button, "onPress");
      expect(mockedNavigation).toHaveBeenCalledTimes(1);
    });
    it("should render the CdcGenericError component if cdcEnrollUserToBonus is not ready", () => {
      const store: Store<GlobalState> = createStore(
        appReducer,
        globalState as any
      );
      const component = renderComponent(store);

      expect(component.getByTestId("cdcGenericError"));
    });
    it("should render the CdcGenericError component if the kind of cdcEnrollUserToBonus is not partialSuccess", () => {
      const store: Store<GlobalState> = createStore(
        appReducer,
        globalState as any
      );

      store.dispatch(
        cdcEnrollUserToBonus.success({
          kind: "success",
          value: mockedMixedBonusResponse
        })
      );
      const component = renderComponent(store);

      expect(component.getByTestId("cdcGenericError"));
    });
  });
});

function renderComponent(store: Store<GlobalState>) {
  return renderScreenFakeNavRedux<GlobalState>(
    CdcRequestPartiallySuccess,
    ROUTES.MAIN,
    {},
    store
  );
}
