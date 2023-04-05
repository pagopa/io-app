import { fireEvent } from "@testing-library/react-native";
import * as O from "fp-ts/lib/Option";
import * as React from "react";
import configureMockStore from "redux-mock-store";
import { ToolEnum } from "../../../../definitions/content/AssistanceToolConfig";
import { BackendStatus } from "../../../../definitions/content/BackendStatus";
import { Config } from "../../../../definitions/content/Config";
import {
  LevelEnum,
  SectionStatus
} from "../../../../definitions/content/SectionStatus";
import I18n, { setLocale } from "../../../i18n";
import { SectionStatusKey } from "../../../store/reducers/backendStatus";
import { renderScreenFakeNavRedux } from "../../../utils/testWrapper";
import { openWebUrl } from "../../../utils/url";
import { IOColors } from "../../core/variables/IOColors";
import SectionStatusComponent from "../index";

jest.mock("../../../utils/url");

const sectionStatus: SectionStatus = {
  is_visible: true,
  level: LevelEnum.normal,
  web_url: {
    "it-IT": "https://io.italia.it/it/cashback/faq/#n44",
    "en-EN": "https://io.italia.it/en/cashback/faq/#n44"
  },
  message: {
    "it-IT": "message IT",
    "en-EN": "message EN"
  }
};

const mockSectionStatusState = (
  sectionKey: SectionStatusKey,
  sectionStatus: SectionStatus
) => ({
  backendStatus: {
    status: O.some({
      sections: { [sectionKey]: sectionStatus },
      config: {
        assistanceTool: { tool: ToolEnum.none },
        cgn: { enabled: true },
        fims: { enabled: true }
      } as Config
    } as BackendStatus)
  }
});
const mockStore = configureMockStore();

describe("SectionStatusComponent", () => {
  describe("given different locales", () => {
    it("should display the IT message in the label component", () => {
      setLocale("it");
      const component = getComponent("messages");
      expect(
        component.queryByText(RegExp(sectionStatus.message["it-IT"]))
      ).not.toBeNull();
    });

    it("should display the EN message in the label component", () => {
      setLocale("en");
      const component = getComponent("messages");
      expect(
        component.queryByText(new RegExp(sectionStatus.message["en-EN"]))
      ).not.toBeNull();
    });
  });

  [
    [LevelEnum.normal, IOColors.aqua],
    [LevelEnum.warning, IOColors.orange],
    [LevelEnum.critical, IOColors.red]
  ].forEach(([level, color]) => {
    describe(`given the level ${level}`, () => {
      const store = mockStore(
        mockSectionStatusState("messages", {
          ...sectionStatus,
          level: level as LevelEnum
        })
      );

      it(`should apply background color ${color} to the status content`, () => {
        const component = getComponent("messages", store);
        const view = component.getByTestId("SectionStatusContent");
        expect(view).toHaveStyle({ backgroundColor: color });
      });
    });
  });

  describe("when web_url is defined", () => {
    it("should display `more info` text", () => {
      const component = getComponent("messages");
      expect(
        component.queryByText(I18n.t("global.sectionStatus.moreInfo"))
      ).not.toBeNull();
    });

    it("should set the correct a11y properties on the touchable wrapper", () => {
      setLocale("it");
      const component = getComponent("messages");
      const view = component.getByTestId("SectionStatusComponentPressable");
      expect(view.props.accessible).toBe(true);
      expect(view.props.accessibilityLabel).toMatch(
        `${sectionStatus.message["it-IT"]}, ${I18n.t(
          "global.sectionStatus.moreInfo"
        )}`
      );
      expect(view.props.accessibilityHint).toMatch(
        I18n.t("global.accessibility.linkHint")
      );
      expect(view.props.accessibilityRole).toBe("link");
    });

    it("should render the touchable wrapper which opens the correct url", () => {
      setLocale("it");
      const component = getComponent("messages");
      const touchable = component.getByTestId(
        "SectionStatusComponentPressable"
      )!;
      fireEvent.press(touchable);
      expect(openWebUrl).toHaveBeenCalledTimes(1);
      expect(openWebUrl).toHaveBeenCalledWith(sectionStatus.web_url!["it-IT"]);
    });
  });

  describe("when web_url is not defined", () => {
    const store = mockStore(
      mockSectionStatusState("messages", {
        ...sectionStatus,
        web_url: undefined
      })
    );

    it("should set the correct a11y properties to the status content", () => {
      setLocale("it");
      const component = getComponent("messages", store);
      const view = component.getByTestId("SectionStatusContent");
      expect(view.props.accessible).toBe(true);
      expect(view.props.accessibilityRole).toBeUndefined();
      expect(view.props.accessibilityLabel).toMatch(
        `${sectionStatus.message["it-IT"]}, ${I18n.t(
          "global.accessibility.alert"
        )}`
      );
    });

    it("should display the accessibility alert text", () => {
      const component = getComponent("messages");
      expect(
        component.queryByText(new RegExp(I18n.t("global.accessibility.alert")))
      ).toBeNull();
    });

    it("should render the touchable wrapper which opens the correct url", () => {
      setLocale("it");
      const component = getComponent("messages", store);
      const touchable = component.queryByTestId(
        "SectionStatusComponentPressable"
      )!;
      expect(touchable).toBeNull();
    });
  });
});

describe("Section Status Component should return null", () => {
  it("when sectionStatus is none", () => {
    const component = getComponent(
      "messages",
      mockStore({
        backendStatus: { status: O.none }
      })
    );
    expect(component.queryByTestId("SectionStatusComponentLabel")).toBeNull();
    expect(
      component.queryByTestId("SectionStatusComponentTouchable")
    ).toBeNull();
  });

  it("when sectionStatus has `is_visible` false", () => {
    const component = getComponent(
      "messages",
      mockStore(
        mockSectionStatusState("messages", {
          ...sectionStatus,
          is_visible: false
        })
      )
    );
    expect(component.queryByTestId("SectionStatusComponentLabel")).toBeNull();
    expect(
      component.queryByTestId("SectionStatusComponentTouchable")
    ).toBeNull();
  });
});

const getComponent = (
  sectionKey: SectionStatusKey,
  store?: ReturnType<typeof mockStore>
) =>
  renderScreenFakeNavRedux(
    () => <SectionStatusComponent sectionKey={sectionKey} />,
    "DUMMY",
    {},
    store || mockStore(mockSectionStatusState("messages", sectionStatus))
  );
