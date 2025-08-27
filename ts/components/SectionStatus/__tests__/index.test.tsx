import { fireEvent } from "@testing-library/react-native";
import * as O from "fp-ts/lib/Option";
import configureMockStore from "redux-mock-store";
import { IOColors } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { ToolEnum } from "../../../../definitions/content/AssistanceToolConfig";
import { Config } from "../../../../definitions/content/Config";
import {
  LevelEnum,
  SectionStatus
} from "../../../../definitions/content/SectionStatus";

import { SectionStatusKey } from "../../../store/reducers/backendStatus/sectionStatus";
import { renderScreenWithNavigationStoreContext } from "../../../utils/testWrapper";
import { openWebUrl } from "../../../utils/url";
import SectionStatusComponent from "../index";
import { PersistedFeaturesState } from "../../../features/common/store/reducers";
import { ItWalletState } from "../../../features/itwallet/common/store/reducers";
import { GlobalState } from "../../../store/reducers/types";
import { CredentialType } from "../../../features/itwallet/common/utils/itwMocksUtils";
import { StoredCredential } from "../../../features/itwallet/common/utils/itwTypesUtils";
import { ItwCredentialsState } from "../../../features/itwallet/credentials/store/reducers";
import { setLocale } from "../../../i18n";

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
  status: SectionStatus
) =>
  ({
    sectionStatus: O.some({ [sectionKey]: status }),
    remoteConfig: O.some({
      assistanceTool: { tool: ToolEnum.none },
      cgn: { enabled: true },
      newPaymentSection: {
        enabled: false,
        min_app_version: {
          android: "0.0.0.0",
          ios: "0.0.0.0"
        }
      },
      fims: { enabled: true },
      itw: {
        enabled: true,
        min_app_version: {
          android: "0.0.0.0",
          ios: "0.0.0.0"
        }
      }
    } as Config),
    features: {
      itWallet: {
        credentials: {
          credentials: { [CredentialType.PID]: {} as StoredCredential }
        } as ItwCredentialsState,
        issuance: { integrityKeyTag: O.some("key-tag") }
      } as ItWalletState
    } as PersistedFeaturesState
  } as unknown as GlobalState);

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
    [LevelEnum.normal, IOColors["info-100"]],
    [LevelEnum.warning, IOColors["warning-100"]],
    [LevelEnum.critical, IOColors["error-100"]]
  ].forEach(([level, color]) => {
    describe(`given the level ${level}`, () => {
      const store = mockStore(
        mockSectionStatusState("messages", {
          ...sectionStatus,
          web_url: undefined,
          level: level as LevelEnum
        })
      );

      it(`should apply background color ${color} to the status content`, () => {
        const component = getComponent("messages", store);
        const view = component.getByTestId("SectionStatusComponentContent");
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
      expect(view.props.accessibilityRole).toBe("button");
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
      const view = component.getByTestId("SectionStatusComponentContent");
      expect(view.props.accessible).toBe(false);
      expect(view.props.accessibilityRole).toBe("alert");
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
        remoteConfig: O.none,
        sectionStatus: O.none,
        features: {
          itWallet: {
            credentials: {
              credentials: { [CredentialType.PID]: {} as StoredCredential }
            } as ItwCredentialsState,
            issuance: { integrityKeyTag: O.some("key-tag") }
          } as ItWalletState
        } as PersistedFeaturesState
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
  renderScreenWithNavigationStoreContext(
    () => <SectionStatusComponent sectionKey={sectionKey} />,
    "DUMMY",
    {},
    store || mockStore(mockSectionStatusState("messages", sectionStatus))
  );
