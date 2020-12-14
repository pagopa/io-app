import configureMockStore from "redux-mock-store";
import { render, fireEvent } from "@testing-library/react-native";
import { Provider } from "react-redux";
import * as React from "react";
import { some } from "fp-ts/lib/Option";
import { SectionStatus, SectionStatusKey } from "../../api/backendPublic";
import SectionStatusComponent, {
  statusColorMap
} from "../SectionStatusComponent";
import I18n, { setLocale } from "../../i18n";
import { openWebUrl } from "../../utils/url";

jest.mock("../../utils/url");

const sectionStatus: SectionStatus = {
  is_visible: true,
  level: "normal",
  web_url: {
    "it-IT": "https://io.italia.it/cashback/faq/#n44",
    "en-EN": "https://io.italia.it/cashback/faq/#n44"
  },
  message: {
    "it-IT": "message IT",
    "en-EN": "message EN"
  }
};

describe("Section Status Component test different rendering states", () => {
  const mockStore = configureMockStore();
  // eslint-disable-next-line functional/no-let
  let store: ReturnType<typeof mockStore>;
  beforeEach(() => {
    store = mockStore(mockSectionStatusState("messages", sectionStatus));
  });

  it("should be not null", () => {
    const component = getComponent("messages", store);
    expect(component).not.toBeNull();
  });

  it("should display a message (IT)", () => {
    setLocale("it");
    const component = getComponent("messages", store);
    const label = component.queryByTestId("SectionStatusComponentLabel");
    expect(label).not.toBeNull();
    expect(label).toHaveTextContent(sectionStatus.message["it-IT"]);
  });

  it("should display a message (EN)", () => {
    setLocale("en");
    const component = getComponent("messages", store);
    const label = component.queryByTestId("SectionStatusComponentLabel");
    expect(label).not.toBeNull();
    expect(label).toHaveTextContent(sectionStatus.message["en-EN"]);
  });

  it("should display a more info link", () => {
    const component = getComponent("messages", store);
    const moreInfo = component.queryByTestId("SectionStatusComponentMoreInfo");
    expect(moreInfo).not.toBeNull();
    expect(moreInfo).toHaveTextContent(I18n.t("global.sectionStatus.moreInfo"));
  });

  it("should be tappable since web url is defined", () => {
    const component = getComponent("messages", store);
    const wholeComponent = component.queryByTestId(
      "SectionStatusComponentTouchable"
    );
    expect(wholeComponent).not.toBeNull();
    if (wholeComponent) {
      fireEvent.press(wholeComponent);
      expect(openWebUrl).toHaveBeenCalled();
    }
  });

  it("should render the right color", () => {
    const component = getComponent("messages", store);
    const view = component.queryByTestId("SectionStatusComponentTouchable");
    expect(view).not.toBeNull();
    expect(view).toHaveStyle({ backgroundColor: statusColorMap.normal });
  });

  it("should be null", () => {
    const component = getComponent("cashback", store);
    expect(component).not.toBeNull();
    const view = component.queryByTestId("SectionStatusComponentTouchable");
    expect(view).toBeNull();
  });
});

describe("Section Status Component test no rendering conditions", () => {
  const mockStore = configureMockStore();
  // eslint-disable-next-line functional/no-let
  let store: ReturnType<typeof mockStore>;
  beforeEach(() => {
    store = mockStore(
      mockSectionStatusState("messages", {
        ...sectionStatus,
        is_visible: false
      })
    );
  });

  it("should be null", () => {
    const component = getComponent("messages", store);
    expect(component).not.toBeNull();
    const view = component.queryByTestId("SectionStatusComponentTouchable");
    expect(view).toBeNull();
  });
});

const mockSectionStatusState = (
  sectionKey: SectionStatusKey,
  sectionStatus: SectionStatus
) => ({
  backendStatus: { status: some({ sections: { [sectionKey]: sectionStatus } }) }
});

const getComponent = (sectionKey: SectionStatusKey, store: any) =>
  render(
    <Provider store={store}>
      <SectionStatusComponent sectionKey={sectionKey} />
    </Provider>
  );
