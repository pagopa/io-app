import { fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";

import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { trackMessageNotFoundScreen } from "../../../analytics";
import { MESSAGES_ROUTES } from "../../../navigation/routes";
import {
  MessageRouterScreenErrorComponent,
  testable
} from "../MessageRouterScreenErrorComponent";

jest.mock("../../../../../components/ui/AnimatedPictogram", () => ({
  AnimatedPictogram: () => null,
  IOAnimatedPictogramsAssets: {}
}));

jest.mock("../../../analytics", () => ({
  trackMessageNotFoundScreen: jest.fn()
}));

const mockVariantSelector = jest.fn();
jest.mock("../../../store/reducers/messageGetStatus", () => ({
  ...jest.requireActual("../../../store/reducers/messageGetStatus"),
  messageRouterScreenErrorVariantSelector: (...props: any) =>
    mockVariantSelector(...props)
}));

const { getMessageRouterErrorMap } = testable!;

const TEST_MESSAGE_ID = "test-message-id";

const mockOnRetry = jest.fn();
const mockOnCancel = jest.fn();

type Variant = keyof ReturnType<typeof getMessageRouterErrorMap>;

type VariantScenario = {
  name: string;
  /** Whether the primary button dispatches `onCancel` instead of `onRetry` */
  primaryIsCancel: boolean;
  primaryTestId: string;
  secondaryTestId: null | string;
  variant: Variant;
};

const variantScenarios: Array<VariantScenario> = [
  {
    name: "messageNotFound",
    variant: "messageNotFound",
    primaryTestId: "messageRouterError-close-button",
    secondaryTestId: null,
    primaryIsCancel: true
  },
  {
    name: "thirdPartyError",
    variant: "thirdPartyError",
    primaryTestId: "messageRouterError-retry-button",
    secondaryTestId: "messageRouterError-cancel-button",
    primaryIsCancel: false
  },
  {
    name: "genericError",
    variant: "genericError",
    primaryTestId: "messageRouterError-retry-button",
    secondaryTestId: "messageRouterError-cancel-button",
    primaryIsCancel: false
  }
];

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("getMessageRouterErrorMap", () => {
  it("matches snapshot", () => {
    const errorMap = getMessageRouterErrorMap(mockOnRetry, mockOnCancel);
    expect(errorMap).toMatchSnapshot();
  });
});

variantScenarios.forEach(
  ({ name, variant, primaryTestId, secondaryTestId, primaryIsCancel }) => {
    describe(`variant: ${name}`, () => {
      beforeEach(() => {
        jest.resetAllMocks();
        jest.clearAllMocks();
        jest.restoreAllMocks();
        mockVariantSelector.mockReturnValue(variant);
      });

      it("MessageRouterScreenErrorComponent matches snapshot", () => {
        const component = renderComponent();
        expect(component.toJSON()).toMatchSnapshot();
      });

      it("primary button calls the correct callback", () => {
        const component = renderComponent();
        const button = component.getByTestId(primaryTestId);

        expect(mockOnRetry).not.toHaveBeenCalled();
        expect(mockOnCancel).not.toHaveBeenCalled();

        fireEvent(button, "onPress");

        if (primaryIsCancel) {
          expect(mockOnCancel).toHaveBeenCalledTimes(1);
          expect(mockOnRetry).not.toHaveBeenCalled();
        } else {
          expect(mockOnRetry).toHaveBeenCalledTimes(1);
          expect(mockOnCancel).not.toHaveBeenCalled();
        }
      });

      if (secondaryTestId !== null) {
        it("secondary button calls onCancel", () => {
          const component = renderComponent();
          const button = component.getByTestId(secondaryTestId);

          expect(mockOnRetry).not.toHaveBeenCalled();
          expect(mockOnCancel).not.toHaveBeenCalled();

          fireEvent(button, "onPress");

          expect(mockOnCancel).toHaveBeenCalledTimes(1);
          expect(mockOnRetry).not.toHaveBeenCalled();
        });
      }
    });
  }
);

describe("messageNotFound screen view tracking", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("tracks when the messageNotFound variant is rendered", () => {
    mockVariantSelector.mockReturnValue("messageNotFound");
    expect(trackMessageNotFoundScreen).toHaveBeenCalledTimes(0);

    renderComponent();

    expect(trackMessageNotFoundScreen).toHaveBeenCalledTimes(1);
  });

  it.each(["genericError", "thirdPartyError"] as const)(
    "does not track when the %s variant is rendered",
    variant => {
      mockVariantSelector.mockReturnValue(variant);

      expect(trackMessageNotFoundScreen).not.toHaveBeenCalled();
      renderComponent();

      expect(trackMessageNotFoundScreen).not.toHaveBeenCalled();
    }
  );
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

const renderComponent = () => {
  const store = createStore(
    appReducer,
    appReducer(undefined, applicationChangeState("active")) as any
  );
  return renderScreenWithNavigationStoreContext(
    () => (
      <MessageRouterScreenErrorComponent
        messageId={TEST_MESSAGE_ID}
        onCancel={mockOnCancel}
        onRetry={mockOnRetry}
      />
    ),
    MESSAGES_ROUTES.MESSAGE_ROUTER,
    {},
    store
  );
};
