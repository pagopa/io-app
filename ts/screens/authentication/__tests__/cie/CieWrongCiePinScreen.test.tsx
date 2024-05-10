import { createStore } from "redux";
import I18n from "../../../../i18n";
import ROUTES from "../../../../navigation/routes";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import CieWrongCiePinScreen from "../../cie/CieWrongCiePinScreen";

type Test = {
  remainingCount: number;
  title: string;
  subtitle: string;
  actionLabel: string;
  secondaryActionLabel: string;
};

const tests = Array<Test>(
  {
    remainingCount: 2,
    title: I18n.t("authentication.cie.pin.incorrectCiePinTitle1"),
    subtitle: I18n.t("authentication.cie.pin.incorrectCiePinContent1"),
    actionLabel: I18n.t("global.buttons.retry"),
    secondaryActionLabel: I18n.t("global.buttons.close")
  },
  {
    remainingCount: 1,
    title: I18n.t("authentication.cie.pin.incorrectCiePinTitle2"),
    subtitle: I18n.t("authentication.cie.pin.incorrectCiePinContent2"),
    actionLabel: I18n.t("global.buttons.retry"),
    secondaryActionLabel: I18n.t(
      "authentication.cie.pin.incorrectCiePinSecondaryActionLabel2"
    )
  },
  {
    remainingCount: 0,
    title: I18n.t("authentication.cie.pin.lockedCiePinTitle"),
    subtitle: I18n.t("authentication.cie.pin.lockedCiePinContent"),
    actionLabel: I18n.t("global.buttons.close"),
    secondaryActionLabel: I18n.t(
      "authentication.cie.pin.lockedSecondaryActionLabel"
    )
  }
);

const useCaseThatShouldNotHappen: Test = {
  remainingCount: -1,
  title: I18n.t("global.genericError"),
  subtitle: "-1",
  actionLabel: I18n.t("global.buttons.retry"),
  secondaryActionLabel: I18n.t("global.buttons.close")
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
    ROUTES.AUTHENTICATION_OPT_IN,
    { remainingCount },
    store
  );
};
