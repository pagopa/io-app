import { createStore } from "redux";
import ROUTES from "../../../../navigation/routes";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import CieWrongCiePinScreen from "../../cie/CieWrongCiePinScreen";

describe("CieWrongCiePinScreen", () => {
  it("it should render correctly, with 2 remainig attemps", () => {
    const component = renderComponent(2);
    expect(component).toBeDefined();
    expect(component.getByText("Il PIN non è corretto")).toBeDefined();
  });
  it("it should render correctly, with 1 remainig attemps", () => {
    const component = renderComponent(1);
    expect(component).toBeDefined();
    expect(
      component.getByText("Hai inserito un PIN errato per 2 volte")
    ).toBeDefined();
  });
  it("it should render correctly, with 0 remainig attemps", () => {
    const component = renderComponent(0);
    expect(component).toBeDefined();
    expect(
      component.getByText("Hai inserito un PIN errato per troppe volte")
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
