import { Body } from "@pagopa/io-app-design-system";
import { fireEvent, render } from "@testing-library/react-native";
import { ItwCredentialClaimsCard } from "../index";

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

const HEADER_GRADIENT_COLOR = "#003399";

describe("ItwCredentialClaimsCard", () => {
  describe("static header", () => {
    it("should match the snapshot", () => {
      const component = render(
        <ItwCredentialClaimsCard
          title="Tessera Sanitaria"
          headerGradientColor={HEADER_GRADIENT_COLOR}
        >
          <Body>Card content</Body>
        </ItwCredentialClaimsCard>
      );
      expect(component).toMatchSnapshot();
    });

    it("should render title and children", () => {
      const { getByText } = render(
        <ItwCredentialClaimsCard
          title="Tessera Sanitaria"
          headerGradientColor={HEADER_GRADIENT_COLOR}
        >
          <Body>Card content</Body>
        </ItwCredentialClaimsCard>
      );
      expect(getByText("Tessera Sanitaria")).toBeTruthy();
      expect(getByText("Card content")).toBeTruthy();
    });
  });

  describe("collapsible header", () => {
    it("should match the snapshot", () => {
      const component = render(
        <ItwCredentialClaimsCard
          collapsible
          title="Tessera Sanitaria"
          headerGradientColor={HEADER_GRADIENT_COLOR}
        >
          <Body>Card content</Body>
        </ItwCredentialClaimsCard>
      );
      expect(component).toMatchSnapshot();
    });

    it("should call onToggle when the header is pressed", () => {
      const onToggle = jest.fn();
      const { getByLabelText } = render(
        <ItwCredentialClaimsCard
          collapsible
          title="Tessera Sanitaria"
          headerGradientColor={HEADER_GRADIENT_COLOR}
          onToggle={onToggle}
        >
          <Body>Card content</Body>
        </ItwCredentialClaimsCard>
      );

      fireEvent.press(getByLabelText("Tessera Sanitaria"));

      expect(onToggle).toHaveBeenCalledTimes(1);
      expect(onToggle).toHaveBeenCalledWith(true);
    });

    it("should use the custom accessibility label when provided", () => {
      const { getByLabelText } = render(
        <ItwCredentialClaimsCard
          collapsible
          title="Tessera Sanitaria"
          headerGradientColor={HEADER_GRADIENT_COLOR}
          accessibilityLabel="claims-card"
        >
          <Body>Card content</Body>
        </ItwCredentialClaimsCard>
      );
      expect(getByLabelText("claims-card")).toBeTruthy();
    });

    it("should render the footer", () => {
      const { getByText } = render(
        <ItwCredentialClaimsCard
          collapsible
          title="Tessera Sanitaria"
          headerGradientColor={HEADER_GRADIENT_COLOR}
          footer={<Body>Footer content</Body>}
        >
          <Body>Card content</Body>
        </ItwCredentialClaimsCard>
      );
      expect(getByText("Footer content")).toBeTruthy();
    });
  });
});
