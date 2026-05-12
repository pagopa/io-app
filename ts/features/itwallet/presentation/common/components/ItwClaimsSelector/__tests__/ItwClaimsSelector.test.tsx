import { fireEvent, render } from "@testing-library/react-native";
import { ClaimDisplayFormat } from "../../../../../common/utils/itwClaimsUtils";
import { CredentialType } from "../../../../../common/utils/itwMocksUtils";
import { ItwClaimsSelector } from "../index";

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
      children: React.ReactNode;
      onPress: () => void;
      accessibilityLabel?: string;
      accessibilityRole?: string;
      accessibilityState?: object;
      accessible?: boolean;
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

jest.mock(
  "@pagopa/io-app-design-system/src/hooks/useAccordionAnimation",
  () => ({
    useAccordionAnimation: () => ({
      expanded: false,
      toggleAccordion: jest.fn(),
      onBodyLayout: jest.fn(),
      iconAnimatedStyle: {},
      bodyAnimatedStyle: {},
      bodyInnerStyle: {},
      progress: { value: 0 }
    })
  })
);

describe("ItwClaimsSelector", () => {
  const items: Array<ClaimDisplayFormat> = [
    { id: "name", label: "Name", value: "Mario Rossi" },
    { id: "birth_date", label: "Birth date", value: "1990-01-01" }
  ];

  it.each([
    CredentialType.PID,
    CredentialType.DRIVING_LICENSE,
    CredentialType.EUROPEAN_DISABILITY_CARD,
    CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD,
    CredentialType.AGE_VERIFICATION,
    CredentialType.EDUCATION_ATTENDANCE,
    CredentialType.EDUCATION_DEGREE,
    CredentialType.EDUCATION_DIPLOMA,
    CredentialType.EDUCATION_ENROLLMENT,
    CredentialType.RESIDENCY,
    "Unknown Credential",
    "Unknown Credential Type with Ridicolously Long Long Long Long Name"
  ])(
    "matches snapshot for credential configuration: %s",
    (credentialType: string) => {
      const component = render(
        <ItwClaimsSelector
          credentialType={credentialType}
          items={items}
          accessibilityLabel="claims-selector"
        />
      );

      expect(component).toMatchSnapshot();
    }
  );

  it("renders credential claims", () => {
    const component = render(
      <ItwClaimsSelector
        credentialType="PersonIdentificationData"
        items={items}
        accessibilityLabel="claims-selector"
      />
    );

    expect(component.getByLabelText("claims-selector")).toBeTruthy();
    expect(component.getByText("Name")).toBeTruthy();
    expect(component.getByText("Birth date")).toBeTruthy();
  });

  it("calls onToggle when the accordion header is pressed", () => {
    const onToggle = jest.fn();
    const component = render(
      <ItwClaimsSelector
        credentialType="PersonIdentificationData"
        items={items}
        accessibilityLabel="claims-selector"
        onToggle={onToggle}
      />
    );

    fireEvent.press(component.getByLabelText("claims-selector"));

    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onToggle).toHaveBeenCalledWith(true);
  });
});
