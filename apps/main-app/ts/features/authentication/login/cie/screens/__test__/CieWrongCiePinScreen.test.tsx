import { createStore } from "redux";
import I18n from "i18next";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import CieWrongCiePinScreen from "../../screens/CieWrongCiePinScreen";
import { AUTHENTICATION_ROUTES } from "../../../../common/navigation/routes";

const closeLabel = I18n.t("global.buttons.close");
const retryLabel = I18n.t("global.buttons.retry");

type Test = {
  remainingCount: number;
  title: string;
  subtitle: string;
  actionLabel: string;
  actionTestID: string;
  secondaryActionLabel: string;
  secondaryActionTestID: string;
};

const tests: Array<Test> = [
  {
    remainingCount: 2,
    title: I18n.t("authentication.cie.pin.incorrectCiePinTitle1"),
    subtitle: I18n.t("authentication.cie.pin.incorrectCiePinContent1"),
    actionLabel: retryLabel,
    actionTestID: `message-action-${retryLabel}`,
    secondaryActionLabel: closeLabel,
    secondaryActionTestID: `message-action-${closeLabel}`
  },
  {
    remainingCount: 1,
    title: I18n.t("authentication.cie.pin.incorrectCiePinTitle2"),
    subtitle: I18n.t("authentication.cie.pin.incorrectCiePinContent2"),
    actionLabel: retryLabel,
    actionTestID: `message-action-${retryLabel}`,
    secondaryActionLabel: I18n.t(
      "authentication.cie.pin.incorrectCiePinSecondaryActionLabel2"
    ),
    secondaryActionTestID: `message-action-${I18n.t(
      "authentication.cie.pin.incorrectCiePinSecondaryActionLabel2"
    )}`
  },
  {
    remainingCount: 0,
    title: I18n.t("authentication.cie.pin.lockedCiePinTitle"),
    subtitle: I18n.t("authentication.cie.pin.lockedCiePinContent"),
    actionLabel: closeLabel,
    actionTestID: `message-action-${closeLabel}`,
    secondaryActionLabel: I18n.t(
      "authentication.cie.pin.lockedSecondaryActionLabel"
    ),
    secondaryActionTestID: `message-action-${I18n.t(
      "authentication.cie.pin.lockedSecondaryActionLabel"
    )}`
  }
];

const useCaseThatShouldNotHappen: Test = {
  remainingCount: -1,
  title: I18n.t("global.genericError"),
  subtitle: "-1",
  actionLabel: retryLabel,
  actionTestID: `message-action-${retryLabel}`,
  secondaryActionLabel: closeLabel,
  secondaryActionTestID: `message-action-${closeLabel}`
};

describe("CieWrongCiePinScreen", () => {
  tests.forEach(test => {
    it(`it should render correctly, with ${test.remainingCount} remainig attemps`, () => {
      const component = renderComponent(test.remainingCount);
      expect(component).toBeDefined();
      expect(component.getByText(test.title)).toBeDefined();
      expect(component.getByText(test.subtitle)).toBeDefined();
      expect(component.getByText(test.actionLabel)).toBeDefined();
      expect(component.getByText(test.secondaryActionLabel)).toBeDefined();
      expect(component.getByTestId(test.actionTestID)).toBeDefined();
      expect(component.getByTestId(test.secondaryActionTestID)).toBeDefined();
    });
  });
  it("it should render the default message, in case of unexpetect values", () => {
    const component = renderComponent(
      useCaseThatShouldNotHappen.remainingCount
    );
    expect(component).toBeDefined();
    expect(component.queryByText(tests[0].title)).toBeNull();
    expect(component.queryByText(tests[0].subtitle)).toBeNull();
    expect(component.getByText(I18n.t("global.genericError"))).toBeDefined();
    expect(
      component.getByText(useCaseThatShouldNotHappen.actionLabel)
    ).toBeDefined();
    expect(
      component.getByText(useCaseThatShouldNotHappen.secondaryActionLabel)
    ).toBeDefined();
    expect(
      component.getByText(useCaseThatShouldNotHappen.subtitle)
    ).toBeDefined();
  });
});

const renderComponent = (remainingCount: number) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, globalState as any);

  return renderScreenWithNavigationStoreContext(
    CieWrongCiePinScreen,
    AUTHENTICATION_ROUTES.OPT_IN,
    { remainingCount },
    store
  );
};
