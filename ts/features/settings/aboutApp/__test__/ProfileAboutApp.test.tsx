import { fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";
import I18n from "i18next";
import { openWebUrl } from "../../../../utils/url";
import ProfileAboutApp from "../screens/ProfileAboutApp";
import { appReducer } from "../../../../store/reducers";
import { applicationChangeState } from "../../../../store/actions/application";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { SETTINGS_ROUTES } from "../../common/navigation/routes";

jest.mock("../../../../utils/url");

describe("ProfileAboutApp", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render the component correctly", () => {
    const { getByText, getAllByText } = renderComponent();

    expect(
      getAllByText(I18n.t("profile.main.appInfo.title")).length
    ).toBeGreaterThanOrEqual(1);
    expect(getByText(I18n.t("profile.main.appInfo.subtitle"))).toBeTruthy();
    expect(
      getAllByText(I18n.t("profile.main.appInfo.paragraphTitle")).length
    ).toBeGreaterThanOrEqual(1);
    expect(
      getByText(I18n.t("profile.main.appInfo.paragraphBody1"))
    ).toBeTruthy();
    expect(
      getByText(I18n.t("profile.main.appInfo.paragraphBody2"))
    ).toBeTruthy();
    expect(getByText(I18n.t("profile.main.appInfo.bannerBody"))).toBeTruthy();
    expect(getByText(I18n.t("profile.main.appInfo.bannerButton"))).toBeTruthy();
  });

  it("should call openWebUrl when the banner button is pressed", () => {
    const { getByText } = renderComponent();
    const bannerButton = getByText(I18n.t("profile.main.appInfo.bannerButton"));

    fireEvent.press(bannerButton);

    expect(openWebUrl).toHaveBeenCalledWith("https://io.italia.it/");
  });

  it("should match the snapshot", () => {
    const { toJSON } = renderComponent();
    expect(toJSON()).toMatchSnapshot();
  });
});

const renderComponent = () => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);

  return renderScreenWithNavigationStoreContext(
    () => <ProfileAboutApp />,
    SETTINGS_ROUTES.PROFILE_ABOUT_APP,
    {},
    store
  );
};
