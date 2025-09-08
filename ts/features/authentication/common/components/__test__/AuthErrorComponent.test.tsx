import { fireEvent, render } from "@testing-library/react-native";
import { createStore } from "redux";
import I18n from "i18next";
import AuthErrorComponent, {
  AuthErrorComponentProps
} from "../AuthErrorComponent";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { appReducer } from "../../../../../store/reducers";
import { applicationChangeState } from "../../../../../store/actions/application";

describe("AuthErrorComponent", () => {
  const testCases = [
    {
      description: "renders correctly with generic error code",
      errorCodeOrMessage: "generic",
      expectedTitle: I18n.t("authentication.auth_errors.generic.title"),
      expectedSubtitle: I18n.t("authentication.auth_errors.generic.subtitle"),
      expectRetryCalled: true,
      expectCancelCalled: true
    },
    {
      description: 'renders correctly with error code "19"',
      errorCodeOrMessage: "19",
      expectedTitle: I18n.t("authentication.auth_errors.error_19.title"),
      expectedSubtitle: I18n.t("authentication.auth_errors.error_19.subtitle"),
      expectRetryCalled: true,
      expectCancelCalled: true
    },
    {
      description: 'renders correctly with error code "20"',
      errorCodeOrMessage: "20",
      expectedTitle: I18n.t("authentication.auth_errors.error_20.title"),
      expectedSubtitle: I18n.t("authentication.auth_errors.error_20.subtitle"),
      expectRetryCalled: true,
      expectCancelCalled: true
    },
    {
      description: 'renders correctly with error code "21"',
      errorCodeOrMessage: "21",
      expectedTitle: I18n.t("authentication.auth_errors.error_21.title"),
      expectedSubtitle: I18n.t("authentication.auth_errors.error_21.subtitle"),
      expectRetryCalled: true,
      expectCancelCalled: true
    },
    {
      description: 'renders correctly with error code "22"',
      errorCodeOrMessage: "22",
      expectedTitle: I18n.t("authentication.auth_errors.error_22.title"),
      expectedSubtitle: I18n.t("authentication.auth_errors.error_22.subtitle"),
      expectRetryCalled: true,
      expectCancelCalled: true
    },
    {
      description: 'renders correctly with error code "23"',
      errorCodeOrMessage: "23",
      expectedTitle: I18n.t("authentication.auth_errors.error_23.title"),
      expectedSubtitle: I18n.t("authentication.auth_errors.error_23.subtitle"),
      expectRetryCalled: false,
      expectCancelCalled: true
    },
    {
      description: 'renders correctly with error code "25"',
      errorCodeOrMessage: "25",
      expectedTitle: I18n.t("authentication.auth_errors.error_25.title"),
      expectedSubtitle: I18n.t("authentication.auth_errors.error_25.subtitle"),
      expectRetryCalled: true,
      expectCancelCalled: true
    },
    {
      description: 'renders correctly with error code "1001"',
      errorCodeOrMessage: "1001",
      expectedTitle: I18n.t("authentication.auth_errors.error_1001.title"),
      expectedSubtitle: I18n.t(
        "authentication.auth_errors.error_1001.subtitle"
      ),
      expectRetryCalled: false,
      expectCancelCalled: true
    }
  ];

  testCases.forEach(
    ({
      description,
      errorCodeOrMessage,
      expectedTitle,
      expectedSubtitle,
      expectRetryCalled,
      expectCancelCalled
    }) => {
      test(description, () => {
        const onRetryMock = jest.fn();
        const onCancelMock = jest.fn();

        const { getByText, getByLabelText, queryByText } = render(
          <AuthErrorComponent
            authLevel="L2"
            errorCodeOrMessage={errorCodeOrMessage}
            onRetry={onRetryMock}
            onCancel={onCancelMock}
          />
        );

        if (expectedTitle && expectedSubtitle) {
          expect(getByText(expectedTitle)).toBeDefined();
          expect(getByText(expectedSubtitle)).toBeDefined();
        } else {
          expect(
            queryByText(I18n.t("authentication.auth_errors.generic.title"))
          ).toBeNull();
          expect(
            queryByText(I18n.t("authentication.auth_errors.generic.subtitle"))
          ).toBeNull();
        }

        if (expectRetryCalled) {
          fireEvent.press(getByLabelText(I18n.t("global.buttons.retry")));
          expect(onRetryMock).toHaveBeenCalled();
        }

        if (expectCancelCalled) {
          fireEvent.press(getByLabelText(I18n.t("global.buttons.close")));
          expect(onCancelMock).toHaveBeenCalled();
        }
      });
    }
  );

  test('renders UnlockAccessComponent when errorCodeOrMessage is "1002"', () => {
    const { getByText } = renderComponent({
      authLevel: "L2",
      errorCodeOrMessage: "1002",
      onRetry: jest.fn(),
      onCancel: jest.fn()
    });
    expect(getByText(I18n.t("authentication.unlock.subtitlel2"))).toBeTruthy();
  });

  test("renders GENERIC_ERROR when errorCodeOrMessage is unknown", () => {
    const { getByText } = renderComponent({
      authLevel: "L2",
      errorCodeOrMessage: "unknown_error",
      onRetry: jest.fn(),
      onCancel: jest.fn()
    });

    expect(
      getByText(I18n.t("authentication.auth_errors.generic.title"))
    ).toBeTruthy();
    expect(
      getByText(I18n.t("authentication.auth_errors.generic.subtitle"))
    ).toBeTruthy();
  });

  test("renders GENERIC_ERROR when no errorCodeOrMessage is provided", () => {
    const { getByText } = renderComponent({
      authLevel: "L2",
      onRetry: jest.fn(),
      onCancel: jest.fn()
    });

    expect(
      getByText(I18n.t("authentication.auth_errors.generic.title"))
    ).toBeTruthy();
  });
});

const renderComponent = (props: AuthErrorComponentProps) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);
  return renderScreenWithNavigationStoreContext(
    () => <AuthErrorComponent {...props} />,
    "DUMMY",
    {},
    store
  );
};
