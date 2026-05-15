import * as pot from "@pagopa/ts-commons/lib/pot";
import { fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { MESSAGES_ROUTES } from "../../../navigation/routes";
import {
  MessageGetStatusFailurePhaseType,
  messageGetStatusErrorPhaseSelector
} from "../../../store/reducers/messageGetStatus";
import { getPaginatedMessageById } from "../../../store/reducers/paginatedById";
import {
  MessageRouterScreenErrorComponent,
  testable
} from "../MessageRouterScreenErrorComponent";

jest.mock("../../../../../components/ui/AnimatedPictogram", () => ({
  AnimatedPictogram: () => null,
  IOAnimatedPictogramsAssets: {}
}));

jest.mock("../../../store/reducers/messageGetStatus", () => ({
  ...jest.requireActual("../../../store/reducers/messageGetStatus"),
  messageGetStatusErrorPhaseSelector: jest.fn()
}));

jest.mock("../../../store/reducers/paginatedById", () => ({
  ...jest.requireActual("../../../store/reducers/paginatedById"),
  getPaginatedMessageById: jest.fn()
}));

const mockPhaseSelector = jest.mocked(messageGetStatusErrorPhaseSelector);
const mockPaginatedSelector = jest.mocked(getPaginatedMessageById);

const { messageRouterErrorVariantSelector, getMessageRouterErrorMap } =
  testable!;

const TEST_MESSAGE_ID = "test-message-id";

const mockOnRetry = jest.fn();
const mockOnCancel = jest.fn();

type Variant = keyof ReturnType<typeof getMessageRouterErrorMap>;

type VariantScenario = {
  name: string;
  variant: Variant;
  /** Value returned by `messageGetStatusErrorPhaseSelector` for this scenario */
  errorPhase: MessageGetStatusFailurePhaseType;
  /** Error kind returned by `getPaginatedMessageById`, when it should be an error pot */
  paginatedErrorKind: "messageNotFound" | undefined;
  primaryTestId: string;
  secondaryTestId: string | null;
  /** Whether the primary button dispatches `onCancel` instead of `onRetry` */
  primaryIsCancel: boolean;
};

const variantScenarios: Array<VariantScenario> = [
  {
    name: "messageNotFound",
    variant: "messageNotFound",
    errorPhase: "paginatedMessage",
    paginatedErrorKind: "messageNotFound",
    primaryTestId: "messageRouterError-close-button",
    secondaryTestId: null,
    primaryIsCancel: true
  },
  {
    name: "thirdPartyError",
    variant: "thirdPartyError",
    errorPhase: "thirdPartyMessageDetails",
    paginatedErrorKind: undefined,
    primaryTestId: "messageRouterError-retry-button",
    secondaryTestId: "messageRouterError-cancel-button",
    primaryIsCancel: false
  },
  {
    name: "genericError",
    variant: "genericError",
    errorPhase: "messageDetails",
    paginatedErrorKind: undefined,
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
  ({
    name,
    variant,
    errorPhase,
    paginatedErrorKind,
    primaryTestId,
    secondaryTestId,
    primaryIsCancel
  }) => {
    describe(`variant: ${name}`, () => {
      beforeEach(() => {
        jest.resetAllMocks();
        jest.clearAllMocks();
        jest.restoreAllMocks();
        mockPhaseSelector.mockReturnValue(errorPhase);
        mockPaginatedSelector.mockReturnValue(
          paginatedErrorKind !== undefined
            ? pot.toError(pot.none, {
                error: new Error(),
                kind: paginatedErrorKind
              })
            : pot.none
        );
      });

      it("messageRouterErrorVariantSelector returns correct variant", () => {
        const result = messageRouterErrorVariantSelector(
          {} as GlobalState,
          TEST_MESSAGE_ID
        );
        expect(result).toBe(variant);
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
        onRetry={mockOnRetry}
        onCancel={mockOnCancel}
      />
    ),
    MESSAGES_ROUTES.MESSAGE_ROUTER,
    {},
    store
  );
};
