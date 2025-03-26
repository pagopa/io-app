import configureMockStore from "redux-mock-store";
import { renderScreenWithNavigationStoreContext } from "../../../utils/testWrapper";
import { appReducer } from "../../../store/reducers";
import { applicationChangeState } from "../../../store/actions/application";
import ROUTES from "../../../navigation/routes";
import { GlobalState } from "../../../store/reducers/types";
import UnlockAccessScreen from "../screens/UnlockAccessScreen";
import I18n from "../../../i18n";
import { UnlockAccessProps } from "../components/UnlockAccessComponent";

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
      ROUTES.UNLOCK_ACCESS_SCREEN,
      {
        ...props
      },
      store
    )
  };
};
