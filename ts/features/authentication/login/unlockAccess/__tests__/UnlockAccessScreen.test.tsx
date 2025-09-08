import configureMockStore from "redux-mock-store";
import I18n from "i18next";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { appReducer } from "../../../../../store/reducers";
import { applicationChangeState } from "../../../../../store/actions/application";
import { GlobalState } from "../../../../../store/reducers/types";
import UnlockAccessScreen from "../../../login/unlockAccess/screens/UnlockAccessScreen";
import { UnlockAccessProps } from "../components/UnlockAccessComponent";
import { AUTHENTICATION_ROUTES } from "../../../common/navigation/routes";

describe("UnlockAccessScreen", () => {
  it("render UnlockAccessComponent with authLevel L2", () => {
    const component = renderComponent({ authLevel: "L2" });

    expect(
      component.screen.getAllByText(I18n.t("authentication.unlock.title"))
    ).toHaveLength(2);

    expect(
      component.screen.getByText(I18n.t("authentication.unlock.subtitlel2"))
    ).toBeTruthy();
  });

  it("render UnlockAccessComponent with authLevel L3", () => {
    const component = renderComponent({ authLevel: "L3" });

    expect(
      component.screen.getAllByText(I18n.t("authentication.unlock.title"))
    ).toHaveLength(2);
    expect(
      component.screen.getByText(I18n.t("authentication.unlock.subtitlel3"))
    ).toBeTruthy();
  });
});

const renderComponent = (props: UnlockAccessProps) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore({
    ...globalState
  } as GlobalState);

  return {
    screen: renderScreenWithNavigationStoreContext<GlobalState>(
      UnlockAccessScreen,
      AUTHENTICATION_ROUTES.UNLOCK_ACCESS_SCREEN,
      {
        ...props
      },
      store
    )
  };
};
