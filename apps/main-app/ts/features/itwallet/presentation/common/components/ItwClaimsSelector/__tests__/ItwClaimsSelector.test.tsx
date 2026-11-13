import { fireEvent, render } from "@testing-library/react-native";

import { withStore } from "../../../../../../../utils/jest/withStore";
import { useCredentialCardConfig } from "../../../../../common/components/ItwCredentialCard/config";
import { ClaimDisplayFormat } from "../../../../../common/utils/itwClaimsUtils";
import { ItwClaimsSelector } from "../index";

jest.mock("../../../../../common/components/ItwCredentialCard/config", () => ({
  useCredentialCardConfig: jest.fn(() => ({
    background: { colors: ["#123456"] }
  }))
}));

jest.mock("../../../../../common/hooks/useItwCredentialName", () => ({
  useItwCredentialName: (credentialType: string) =>
    `catalogue-name-${credentialType}`
}));

jest.mock("../../../hooks/useClaimsDetailsBottomSheet", () => ({
  useClaimsDetailsBottomSheet: () => ({
    present: jest.fn(),
    bottomSheet: null
  })
}));

jest.mock("react-native-gesture-handler", () => {
  const React = require("react");
  const { Pressable } = require("react-native");

  return {
    TouchableWithoutFeedback: ({
      children,
      onPress,
      accessibilityLabel,
      accessibilityRole,
      accessibilityState,
      accessible
    }: {
      accessibilityLabel?: string;
      accessibilityRole?: string;
      accessibilityState?: object;
      accessible?: boolean;
      children: React.ReactNode;
      onPress: () => void;
    }) =>
      React.createElement(
        Pressable,
        {
          onPress,
          accessibilityLabel,
          accessibilityRole,
          accessibilityState,
          accessible
        },
        children
      )
  };
});

jest.mock("@io-app/design-system/src/hooks/useAccordionAnimation", () => ({
  useAccordionAnimation: () => ({
    expanded: false,
    toggleAccordion: jest.fn(),
    onBodyLayout: jest.fn(),
    iconAnimatedStyle: {},
    bodyAnimatedStyle: {},
    bodyInnerStyle: {},
    progress: { value: 0 }
  })
}));

const ItwClaimsSelectorWithStore = withStore(ItwClaimsSelector);

describe("ItwClaimsSelector", () => {
  const items: Array<ClaimDisplayFormat> = [
    { id: "name", label: "Name", value: "Mario Rossi" },
    { id: "birth_date", label: "Birth date", value: "1990-01-01" }
  ];

  it("renders credential claims", () => {
    const component = render(
      <ItwClaimsSelectorWithStore
        accessibilityLabel="claims-selector"
        credentialType="PersonIdentificationData"
        items={items}
      />
    );

    expect(component.getByLabelText("claims-selector")).toBeTruthy();
    expect(component.getByText("Name")).toBeTruthy();
    expect(component.getByText("Birth date")).toBeTruthy();
  });

  it("renders the credential name resolved from the catalogue as title", () => {
    const component = render(
      <ItwClaimsSelectorWithStore
        accessibilityLabel="claims-selector"
        credentialType="education_diploma"
        items={items}
      />
    );

    expect(
      component.getByText("catalogue-name-education_diploma")
    ).toBeTruthy();
  });

  it("uses the credential card config hook for the claims card background", () => {
    render(
      <ItwClaimsSelectorWithStore
        credentialType="PersonIdentificationData"
        items={items}
      />
    );

    expect(useCredentialCardConfig).toHaveBeenCalledWith(
      "PersonIdentificationData",
      expect.any(String)
    );
  });

  it("calls onToggle when the accordion header is pressed", () => {
    const onToggle = jest.fn();
    const component = render(
      <ItwClaimsSelectorWithStore
        accessibilityLabel="claims-selector"
        credentialType="PersonIdentificationData"
        items={items}
        onToggle={onToggle}
      />
    );

    fireEvent.press(component.getByLabelText("claims-selector"));

    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onToggle).toHaveBeenCalledWith(true);
  });
});
