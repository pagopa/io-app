import { fireEvent, render } from "@testing-library/react-native";
import I18n from "i18next";
import { createStore } from "redux";

import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { LoginFailure } from "../../utils/loginFailure";
import AuthErrorComponent, {
  AuthErrorComponentProps
} from "../AuthErrorComponent";

const backendFailure = (errorCode: string): LoginFailure => ({
  kind: "backend",
  details: { errorCode }
});

describe("AuthErrorComponent", () => {
  const testCases = [
    {
      description: "renders correctly with generic error code",
      errorCode: "generic",
      expectedTitle: I18n.t("authentication.auth_errors.generic.title"),
      expectedSubtitle: I18n.t("authentication.auth_errors.generic.subtitle"),
      expectRetryCalled: true,
      expectCancelCalled: true
    },
    {
      description: 'renders correctly with error code "19"',
      errorCode: "19",
      expectedTitle: I18n.t("authentication.auth_errors.error_19.title"),
      expectedSubtitle: I18n.t("authentication.auth_errors.error_19.subtitle"),
      expectRetryCalled: true,
      expectCancelCalled: true
    },
    {
      description: 'renders correctly with error code "20"',
      errorCode: "20",
      expectedTitle: I18n.t("authentication.auth_errors.error_20.title"),
      expectedSubtitle: I18n.t("authentication.auth_errors.error_20.subtitle"),
      expectRetryCalled: true,
      expectCancelCalled: true
    },
    {
      description: 'renders correctly with error code "21"',
      errorCode: "21",
      expectedTitle: I18n.t("authentication.auth_errors.error_21.title"),
      expectedSubtitle: I18n.t("authentication.auth_errors.error_21.subtitle"),
      expectRetryCalled: true,
      expectCancelCalled: true
    },
    {
      description: 'renders correctly with error code "22"',
      errorCode: "22",
      expectedTitle: I18n.t("authentication.auth_errors.error_22.title"),
      expectedSubtitle: I18n.t("authentication.auth_errors.error_22.subtitle"),
      expectRetryCalled: true,
      expectCancelCalled: true
    },
    {
      description: 'renders correctly with error code "23"',
      errorCode: "23",
      expectedTitle: I18n.t("authentication.auth_errors.error_23.title"),
      expectedSubtitle: I18n.t("authentication.auth_errors.error_23.subtitle"),
      expectRetryCalled: false,
      expectCancelCalled: true
    },
    {
      description: 'renders correctly with error code "25"',
      errorCode: "25",
      expectedTitle: I18n.t("authentication.auth_errors.error_25.title"),
      expectedSubtitle: I18n.t("authentication.auth_errors.error_25.subtitle"),
      expectRetryCalled: true,
      expectCancelCalled: true
    },
    {
      description: 'renders correctly with error code "1001"',
      errorCode: "1001",
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
      errorCode,
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
            failure={backendFailure(errorCode)}
            onCancel={onCancelMock}
            onRetry={onRetryMock}
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

  test('renders UnlockAccessComponent when the error code is "1002"', () => {
    const { getByText } = renderComponent({
      authLevel: "L2",
      failure: backendFailure("1002"),
      onRetry: jest.fn(),
      onCancel: jest.fn()
    });
    expect(getByText(I18n.t("authentication.unlock.subtitlel2"))).toBeTruthy();
  });

  test("renders GENERIC_ERROR when the error code is unknown", () => {
    const { getByText } = renderComponent({
      authLevel: "L2",
      failure: backendFailure("unknown_error"),
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

  test.each<{ failure: LoginFailure; name: string }>([
    {
      name: "the code of a CieID app failure",
      failure: {
        kind: "cieIdApp",
        details: { errorCode: "CIEID_OPERATION_CANCEL" }
      }
    },
    {
      name: "the message of a CieID app failure",
      failure: {
        kind: "cieIdApp",
        details: { errorMessage: "Operazione_annullata_dall'utente" }
      }
    }
  ])("renders the cancelled login content for $name", ({ failure }) => {
    const { getByText } = renderComponent({
      authLevel: "L2",
      failure,
      onRetry: jest.fn(),
      onCancel: jest.fn()
    });

    expect(
      getByText(I18n.t("authentication.auth_errors.error_25.title"))
    ).toBeTruthy();
  });

  test("renders GENERIC_ERROR for a failure that has no code or message", () => {
    const { getByText } = renderComponent({
      authLevel: "L2",
      failure: {
        kind: "webViewHttp",
        details: { description: "", statusCode: 500, url: "https://x" }
      },
      onRetry: jest.fn(),
      onCancel: jest.fn()
    });

    expect(
      getByText(I18n.t("authentication.auth_errors.generic.title"))
    ).toBeTruthy();
  });

  test("renders GENERIC_ERROR when no failure is provided", () => {
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
