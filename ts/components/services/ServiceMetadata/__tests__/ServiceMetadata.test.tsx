import { OrganizationFiscalCode } from "@pagopa/ts-commons/lib/strings";
import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import { testableGenServiceMetadataAccessibilityLabel } from "../";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { ServiceMetadata } from "../../../../../definitions/backend/ServiceMetadata";
import { ServiceScopeEnum } from "../../../../../definitions/backend/ServiceScope";
import { StandardServiceCategoryEnum } from "../../../../../definitions/backend/StandardServiceCategory";
import { TranslationKeys } from "../../../../../locales/locales";
import I18n from "../../../../i18n";
import { capitalize } from "../../../../utils/strings";
import * as utilsUrl from "../../../../utils/url";
import ServiceMetadataComponent from "../../ServiceMetadata";

jest.mock("../../../../utils/platform");

const spyOpenWebUrl = jest.spyOn(utilsUrl, "openWebUrl");

const defaultServiceMetadata: ServiceMetadata = {
  scope: ServiceScopeEnum.NATIONAL,
  category: StandardServiceCategoryEnum.STANDARD
};

const defaultProps = {
  getItemOnPress: jest.fn(),
  isDebugModeEnabled: false,
  organizationFiscalCode: "01234567891" as OrganizationFiscalCode,
  serviceId: "ABC123" as ServiceId,
  servicesMetadata: defaultServiceMetadata
};

const genServiceMetadataAccessibilityLabel =
  testableGenServiceMetadataAccessibilityLabel!;

describe("ServiceMetadata component", () => {
  beforeEach(() => {
    defaultProps.getItemOnPress.mockReset();
    spyOpenWebUrl.mockReset();
  });
  afterEach(() => {
    jest.dontMock("../../../../utils/url");
  });

  it("should render the section header", () => {
    expect(
      renderComponent({ ...defaultProps }).getByText(
        I18n.t("services.contactsAndInfo")
      )
    ).toBeDefined();
  });

  describe("when debug mode is enabled", () => {
    const currentOptions = {
      ...defaultProps,
      isDebugModeEnabled: true
    };
    it("should render the serviceId label", () => {
      expect(
        renderComponent(currentOptions).getByText(
          capitalize(I18n.t("global.id"))
        )
      ).toBeDefined();
    });

    it("should render the serviceId value", () => {
      expect(
        renderComponent(currentOptions).getByText(currentOptions.serviceId)
      ).toBeDefined();
    });

    it(`should call "getItemOnPress" with (${currentOptions.serviceId}, "COPY")`, () => {
      renderComponent(currentOptions);
      expect(currentOptions.getItemOnPress).toHaveBeenCalledWith(
        currentOptions.serviceId,
        "COPY"
      );
    });
  });

  describe("given an organizationFiscalCode", () => {
    it("should render the organizationFiscalCode label", () => {
      expect(
        renderComponent(defaultProps).getByText(
          capitalize(I18n.t("serviceDetail.fiscalCode"))
        )
      ).toBeDefined();
    });

    it("should render the organizationFiscalCode value", () => {
      expect(
        renderComponent(defaultProps).getByText(
          defaultProps.organizationFiscalCode
        )
      ).toBeDefined();
    });

    it("should render the correct accessibility label", () => {
      const a11yLabel = genServiceMetadataAccessibilityLabel(
        I18n.t("serviceDetail.fiscalCode"),
        defaultProps.organizationFiscalCode,
        I18n.t("serviceDetail.fiscalCodeAccessibilityCopy")
      );

      expect(
        renderComponent(defaultProps).getByA11yLabel(a11yLabel)
      ).toBeDefined();
    });

    it(`should call "getItemOnPress" with (${defaultProps.organizationFiscalCode}, "COPY")`, () => {
      renderComponent(defaultProps);
      expect(defaultProps.getItemOnPress).toHaveBeenCalledWith(
        defaultProps.organizationFiscalCode,
        "COPY"
      );
    });
  });

  [
    [
      "address",
      "via genova",
      "services.contactAddress",
      "MAP",
      "openMaps.openAddressOnMap"
    ]
  ].forEach(([name, value, label, action, hint]) => {
    describe(`when ${name} is defined`, () => {
      const currentOptions = {
        ...defaultProps,
        servicesMetadata: {
          ...defaultServiceMetadata,
          [name]: value
        }
      };
      it(`should render its label "${label}"`, () => {
        expect(
          renderComponent(currentOptions).getByText(
            capitalize(I18n.t(label as TranslationKeys))
          )
        ).toBeDefined();
      });
      it(`should render its value "${value}"`, () => {
        expect(renderComponent(currentOptions).getByText(value)).toBeDefined();
      });
      it(`should call "getItemOnPress" with ("${value}", ${action})`, () => {
        renderComponent(currentOptions);
        expect(currentOptions.getItemOnPress).toHaveBeenCalledWith(
          value,
          action
        );
      });
      it("should render the correct accessibility label", () => {
        const a11yLabel = genServiceMetadataAccessibilityLabel(
          I18n.t(label as TranslationKeys),
          value,
          I18n.t(hint as TranslationKeys)
        );

        expect(
          renderComponent(currentOptions).getByA11yLabel(a11yLabel)
        ).toBeDefined();
      });
    });
  });

  [
    ["email", "jest@test.com", "global.media.email", "mailto:"],
    ["pec", "jest.pec@test.com", "global.media.pec", "mailto:"],
    ["phone", "12341234", "global.media.phone", "tel:"]
  ].forEach(([name, value, label, prefix]) => {
    describe(`when ${name} is defined`, () => {
      const currentOptions = {
        ...defaultProps,
        servicesMetadata: { ...defaultServiceMetadata, [name]: value }
      };
      // eslint-disable-next-line sonarjs/no-identical-functions
      it(`should render its label "${label}"`, () => {
        expect(
          renderComponent(currentOptions).getByText(
            capitalize(I18n.t(label as TranslationKeys))
          )
        ).toBeDefined();
      });
      it(`should render its value "${value}"`, () => {
        expect(renderComponent(currentOptions).getByText(value)).toBeDefined();
      });
      it(`should call "getItemOnPress" with ("${prefix}:${value}")`, () => {
        renderComponent(currentOptions);
        expect(currentOptions.getItemOnPress).toHaveBeenCalledWith(
          `${prefix}${value}`
        );
      });
    });
  });

  [
    ["support_url", "www.support.it", "services.askForAssistance"],
    ["web_url", "www.product.it", "services.visitWebsite"]
  ].forEach(([name, value, label]) => {
    const currentOptions = {
      ...defaultProps,
      servicesMetadata: {
        ...defaultServiceMetadata,
        [name]: value
      }
    };
    describe(`when ${name} is defined`, () => {
      it(`should render a link with "${label}"`, () => {
        const component = renderComponent(currentOptions);
        const link = component.getByRole("link");
        expect(link).toBeDefined();
        expect(link.children.toString()).toMatch(
          I18n.t(label as TranslationKeys)
        );
      });
      describe("when the link is pressed", () => {
        it(`should open the url "${value}"`, () => {
          const component = renderComponent(currentOptions);
          const link = component.getByRole("link");
          fireEvent(link, "onPress");
          expect(spyOpenWebUrl).toHaveBeenCalledWith(
            value,
            expect.any(Function)
          );
        });
      });
    });
  });

  describe("when the platform is Android", () => {
    beforeAll(() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require("../../../../utils/platform").test_setPlatform("android");
    });

    describe(`and servicesMetadata.app_android is defined`, () => {
      const androidUrl = "http://www.android.google";
      const currentOptions = {
        ...defaultProps,
        servicesMetadata: {
          ...defaultServiceMetadata,
          app_android: androidUrl
        } as ServiceMetadata
      };
      it(`should render the Android link`, () => {
        const component = renderComponent(currentOptions);
        const link = component.getByRole("link");
        expect(link.children.toString()).toMatch(
          I18n.t("services.otherAppAndroid")
        );
      });
      it(`the link should open ${androidUrl}`, () => {
        const component = renderComponent(currentOptions);
        const link = component.getByRole("link");
        fireEvent(link, "onPress");
        expect(spyOpenWebUrl).toHaveBeenCalledWith(
          androidUrl,
          expect.any(Function)
        );
      });
    });

    describe(`and servicesMetadata.app_ios is defined`, () => {
      const currentOptions = {
        ...defaultProps,
        servicesMetadata: {
          ...defaultServiceMetadata,
          app_ios: "dummy"
        } as ServiceMetadata
      };
      it(`should not render it`, () => {
        expect(renderComponent(currentOptions).queryByRole("link")).toBeNull();
      });
    });
  });

  describe("when the platform is iOS", () => {
    beforeAll(() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require("../../../../utils/platform").test_setPlatform("ios");
    });

    describe(`and servicesMetadata.app_ios is defined`, () => {
      const iosUrl = "http://www.ios.apple";
      const currentOptions = {
        ...defaultProps,
        servicesMetadata: {
          ...defaultServiceMetadata,
          app_ios: iosUrl
        } as ServiceMetadata
      };
      it(`should render the iOS link`, () => {
        const component = renderComponent(currentOptions);
        const link = component.getByRole("link");
        expect(link.children.toString()).toMatch(
          I18n.t("services.otherAppIos")
        );
      });
      it(`the link should open ${iosUrl}`, () => {
        const component = renderComponent(currentOptions);
        const link = component.getByRole("link");
        fireEvent(link, "onPress");
        expect(spyOpenWebUrl).toHaveBeenCalledWith(
          iosUrl,
          expect.any(Function)
        );
      });
    });

    describe(`and servicesMetadata.app_android is defined`, () => {
      const currentOptions = {
        ...defaultProps,
        servicesMetadata: {
          ...defaultServiceMetadata,
          app_android: "dummy"
        } as ServiceMetadata
      };
      it(`should not render it`, () => {
        expect(renderComponent(currentOptions).queryByRole("link")).toBeNull();
      });
    });
  });
});

function renderComponent(
  props: Parameters<typeof ServiceMetadataComponent>[0]
) {
  return render(<ServiceMetadataComponent {...props} />);
}
