import { act, fireEvent, render } from "@testing-library/react-native";
import { omit } from "lodash";
import * as RN from "react-native";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { useIOBottomSheetModal } from "../../../../../utils/hooks/bottomSheet";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { renderComponentWithStoreAndNavigationContextForFocus } from "../../../../messages/utils/__tests__/testUtils.test";
import PN_ROUTES from "../../../navigation/routes";
import {
  ReadStatus,
  useCieInternalAuthAndMrtdReading
} from "../../hooks/useCieInternalAuthAndMrtdReading";
import { setAarFlowState } from "../../store/actions";
import { sendAARFlowStates } from "../../utils/stateUtils";
import {
  SendAARCieCardReadingComponent,
  SendAARCieCardReadingComponentProps
} from "../SendAARCieCardReadingComponent";
import { useTrackCieReadingEvents } from "../../hooks/useTrackCieReadingEvents";
type ReadState = ReturnType<
  typeof useCieInternalAuthAndMrtdReading
>["readState"];
type ErrorState = Extract<ReadState, { status: ReadStatus.ERROR }>;

const mockStartReading = jest.fn();
const mockStopReading = jest.fn();
const mockDispatch = jest.fn();
const mockTerminateFlow = jest.fn();
const mockPresentBottomSheet = jest.fn();
const mockDismissBottomSheet = jest.fn();

jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useDispatch: () => mockDispatch
}));
jest.mock("../../../../../utils/hooks/bottomSheet");

const testRestartHandlerCalled = (
  restartType: "canAdvisory" | "scanningAdvisory"
) => {
  const { iun, recipientInfo, mandateId, can, verificationCode } =
    cieCardReadingComponentProps;
  expect(mockStopReading).toHaveBeenCalledTimes(1);
  expect(mockDispatch).toHaveBeenCalledTimes(1);
  switch (restartType) {
    case "canAdvisory":
      expect(mockDispatch).toHaveBeenCalledWith(
        setAarFlowState({
          type: sendAARFlowStates.cieCanAdvisory,
          iun,
          recipientInfo,
          mandateId,
          verificationCode
        })
      );
      break;
    case "scanningAdvisory":
      expect(mockDispatch).toHaveBeenCalledWith(
        setAarFlowState({
          type: sendAARFlowStates.cieScanningAdvisory,
          iun,
          recipientInfo,
          mandateId,
          can,
          verificationCode
        })
      );
      break;
  }
};

const mockedUseIOBottomSheetModal = useIOBottomSheetModal as jest.Mock;
mockedUseIOBottomSheetModal.mockImplementation(() => ({
  present: mockPresentBottomSheet,
  dismiss: mockDismissBottomSheet,
  bottomSheet: null
}));
jest.mock("i18next", () => ({
  t: (path: string) => path
}));
jest.mock("../../hooks/useSendAarFlowManager", () => ({
  useSendAarFlowManager: () => ({
    terminateFlow: mockTerminateFlow
  })
}));
jest.mock("../../hooks/useCieInternalAuthAndMrtdReading", () => {
  const actualImplementation = jest.requireActual(
    "../../hooks/useCieInternalAuthAndMrtdReading"
  );

  return {
    ...actualImplementation,
    useCieInternalAuthAndMrtdReading: jest.fn()
  };
});

jest.mock("../../hooks/useTrackCieReadingEvents", () => ({
  useTrackCieReadingEvents: jest.fn()
}));

const cieCardReadingComponentProps: SendAARCieCardReadingComponentProps = {
  can: "123456",
  iun: "iun",
  mandateId: "mandate_id",
  verificationCode: "verification_code",
  recipientInfo: {
    denomination: "",
    taxId: "AAAAAA00A00A000A"
  }
};
const successDataMock: Extract<
  ReadState,
  { status: ReadStatus.SUCCESS }
>["data"] = {
  mrtd_data: {
    dg1: "",
    dg11: "",
    sod: ""
  },
  nis_data: {
    nis: "",
    publicKey: "",
    signedChallenge: "",
    sod: ""
  }
};

const errorsMock: Array<ErrorState["error"]> = [
  { name: "TAG_LOST" },
  { name: "APDU_ERROR" },
  { name: "NOT_A_CIE" },
  { name: "CANCELLED_BY_USER" }
];

const mockUseCieInternalAuthAndMrtdReading =
  useCieInternalAuthAndMrtdReading as jest.Mock<
    ReturnType<typeof useCieInternalAuthAndMrtdReading>
  >;

const mockReadStates: ReadonlyArray<ReadState> = [
  { status: ReadStatus.IDLE },
  { status: ReadStatus.READING, progress: 0 },
  { status: ReadStatus.READING, progress: 0.5 },
  { status: ReadStatus.READING, progress: 1 },
  { status: ReadStatus.SUCCESS, data: successDataMock },
  ...errorsMock.map<ReadState>(error => ({ status: ReadStatus.ERROR, error }))
];

describe("SendAARCieCardReadingComponent", () => {
  afterEach(jest.clearAllMocks);

  it.each<ReadState>(mockReadStates)(
    "should match the snapshot for readState: %o",
    readState => {
      mockReadState(readState);

      const component = renderComponent();

      expect(component).toMatchSnapshot();
    }
  );

  it.each<ReadState>(mockReadStates)(
    'should invoke "useTrackCieReadingEvents" for readState: %o',
    readState => {
      mockReadState(readState);

      renderComponent();

      expect(useTrackCieReadingEvents).toHaveBeenCalledTimes(1);
    }
  );
  describe("SendAARCieCardReadingComponent: ReadState is IDLE", () => {
    beforeEach(() => {
      mockReadState({ status: ReadStatus.IDLE });
    });

    it('should invoke "startReading" only once', () => {
      expect(mockStartReading).toHaveBeenCalledTimes(0);
      const { rerender } = renderComponentWithStoreAndNavigationContextForFocus(
        Component,
        true
      );
      expect(mockStartReading).toHaveBeenCalledTimes(1);

      rerender(Component);
      rerender(Component);
      rerender(Component);
      rerender(Component);
      rerender(Component);
      rerender(Component);

      expect(mockStartReading).toHaveBeenCalledTimes(1);
      expect(mockStartReading).toHaveBeenCalledWith(
        cieCardReadingComponentProps.can,
        cieCardReadingComponentProps.verificationCode,
        "base64url"
      );
    });
    it("should output the right title", () => {
      const { queryByText } = renderComponent();

      expect(
        queryByText("features.pn.aar.flow.cieScanning.idle.title")
      ).toBeTruthy();
    });
    it("should navigate to scanningAdvisory when the cancelAction is triggered", () => {
      const { getByTestId } = renderComponent();
      const closeButton = getByTestId("idleCloseButton");

      expect(closeButton).toBeTruthy();
      expect(mockStopReading).not.toHaveBeenCalled();

      fireEvent.press(closeButton);
      testRestartHandlerCalled("scanningAdvisory");
    });
    it('should invoke "startReading" only once despite transition from IDLE state to READING state', () => {
      const { rerender } = renderComponentWithStoreAndNavigationContextForFocus(
        Component,
        true
      );

      mockReadState({ status: ReadStatus.READING, progress: 0.2 });

      rerender(Component);

      expect(mockStartReading).toHaveBeenCalledTimes(1);
    });
  });
  describe("SendAARCieCardReadingComponent: ReadState is READING", () => {
    beforeEach(() => {
      mockReadState({ status: ReadStatus.READING, progress: 0.1 });
    });
    it("should output the right title and subtitle", () => {
      const { queryByText } = renderComponent();

      expect(
        queryByText("features.pn.aar.flow.cieScanning.reading.title")
      ).toBeTruthy();
      expect(
        queryByText("features.pn.aar.flow.cieScanning.reading.subtitle")
      ).toBeTruthy();
    });
    it('should change the state to "scanningAdvisory" when the cancelAction is triggered', () => {
      const { getByTestId } = renderComponent();
      const closeButton = getByTestId("readingCloseButton");

      expect(closeButton).toBeTruthy();
      expect(mockStopReading).not.toHaveBeenCalled();

      fireEvent.press(closeButton);
      testRestartHandlerCalled("scanningAdvisory");
    });
    it('should invoke "startReading" only once despite transition from READING state to SUCCESS state', () => {
      expect(mockStartReading).toHaveBeenCalledTimes(0);
      const { rerender } = renderComponentWithStoreAndNavigationContextForFocus(
        Component,
        true
      );
      expect(mockStartReading).toHaveBeenCalledTimes(1);

      mockReadState({ status: ReadStatus.SUCCESS, data: successDataMock });
      expect(mockStartReading).toHaveBeenCalledTimes(1);

      rerender(Component);

      expect(mockStartReading).toHaveBeenCalledTimes(1);
    });
    it('should invoke "startReading" only once despite transition from READING state to ERROR state', () => {
      expect(mockStartReading).toHaveBeenCalledTimes(0);
      const { rerender } = renderComponentWithStoreAndNavigationContextForFocus(
        Component,
        true
      );
      expect(mockStartReading).toHaveBeenCalledTimes(1);

      mockReadState({ status: ReadStatus.ERROR, error: errorsMock[0] });
      expect(mockStartReading).toHaveBeenCalledTimes(1);

      rerender(Component);

      expect(mockStartReading).toHaveBeenCalledTimes(1);
    });
  });
  describe("SendAARCieCardReadingComponent: ReadState is SUCCESS", () => {
    beforeEach(() => {
      mockReadState({ status: ReadStatus.SUCCESS, data: successDataMock });
    });

    it("should output the right title", () => {
      const { queryByText } = renderComponent();

      const title = queryByText(
        "features.pn.aar.flow.cieScanning.success.title"
      );
      expect(title).toBeTruthy();
    });
    it("should update the AAR flow state", () => {
      renderComponent();

      expect(mockDispatch).toHaveBeenCalledTimes(1);
      expect(mockDispatch).toHaveBeenCalledWith(
        setAarFlowState({
          type: sendAARFlowStates.validatingMandate,
          iun: cieCardReadingComponentProps.iun,
          mandateId: cieCardReadingComponentProps.mandateId,
          recipientInfo: cieCardReadingComponentProps.recipientInfo,
          nisData: omit(successDataMock.nis_data, ["signedChallenge"]),
          mrtdData: successDataMock.mrtd_data,
          signedVerificationCode: successDataMock.nis_data.signedChallenge,
          unsignedVerificationCode:
            cieCardReadingComponentProps.verificationCode
        })
      );
    });
  });
  describe("SendAARCieCardReadingComponent: ReadState is ERROR", () => {
    const unmappedErrors: Array<ErrorState["error"]> = [
      { name: "CANCELLED_BY_USER" },
      { name: "GENERIC_ERROR" },
      { name: "NOT_A_CIE" },
      { name: "AUTHENTICATION_ERROR" },
      { name: "WRONG_PIN", attemptsLeft: 1 }
    ];
    const mockErrorState = (error: ErrorState["error"]) =>
      mockReadState({ status: ReadStatus.ERROR, error });

    describe("TAG_LOST error", () => {
      beforeEach(() => {
        mockErrorState({ name: "TAG_LOST" });
      });
      it("should output the right title and subtitle", () => {
        const { queryByText } = renderComponent();

        expect(
          queryByText("features.pn.aar.flow.cieScanning.error.TAG_LOST.title")
        ).toBeTruthy();
        expect(
          queryByText(
            "features.pn.aar.flow.cieScanning.error.TAG_LOST.subtitle"
          )
        ).toBeTruthy();
      });
      it('should invoke "startReading" on retry CTA press', () => {
        const { queryByText } = renderComponent();

        // reset the mock triggered on component mount
        mockStartReading.mockClear();

        const retryAction = queryByText("global.buttons.retry");

        expect(retryAction).toBeTruthy();

        act(() => {
          // If passes the previous check we can assume it exists
          fireEvent.press(retryAction!);
        });

        expect(mockStartReading).toHaveBeenCalledTimes(1);
        expect(mockStopReading).not.toHaveBeenCalled();
      });
      it("should go back to the scanning advisory screen when the cancel action is triggered", () => {
        const { getByTestId } = renderComponent();

        const retryButton = getByTestId("tagLostCloseButton");
        expect(retryButton).toBeTruthy();
        expect(mockStopReading).not.toHaveBeenCalled();

        fireEvent.press(retryButton);
        testRestartHandlerCalled("scanningAdvisory");
      });
    });
    describe("WRONG_CAN error", () => {
      beforeEach(() => {
        mockErrorState({ name: "WRONG_CAN" });
      });
      it(
        "should terminate the current flow when the cancel action is triggered",
        testCancelErrorAction
      );
      it("should navigate back to the CAN advisory state on retry CTA press", () => {
        const { getByTestId } = renderComponent();

        const retryButton = getByTestId("wrongCanRetryButton");
        expect(retryButton).toBeTruthy();
        expect(mockStopReading).not.toHaveBeenCalled();

        fireEvent.press(retryButton);
        testRestartHandlerCalled("canAdvisory");
      });
      test.each(["ios", "android"] as const)(
        "should output the right subtitle for platform %s",
        platform => {
          jest
            .spyOn(RN.Platform, "select")
            .mockImplementation(
              options =>
                options[platform] ??
                options["default" as unknown as keyof typeof options]
            );

          const { queryByText } = renderComponent();

          const platformizedSubtitleKey =
            platform === "ios"
              ? "features.pn.aar.flow.cieScanning.error.WRONG_CAN.subtitleIos"
              : "features.pn.aar.flow.cieScanning.error.WRONG_CAN.subtitleAndroid";

          expect(queryByText(platformizedSubtitleKey)).toBeTruthy();
        }
      );
    });
    describe.each(unmappedErrors)("$name error", error => {
      beforeAll(() => {
        mockErrorState(error);
      });
      it("should output the right title", () => {
        const { queryByText } = renderComponent();

        expect(
          queryByText("features.pn.aar.flow.cieScanning.error.GENERIC.title")
        ).toBeTruthy();
      });
      it("should restart to CAN advisory when the primary action is triggered", () => {
        const { getByTestId } = renderComponent();
        const closeButton = getByTestId("genericErrorPrimaryAction");

        expect(closeButton).toBeTruthy();
        expect(mockStopReading).not.toHaveBeenCalled();

        act(() => {
          fireEvent.press(closeButton);
        });

        testRestartHandlerCalled("canAdvisory");
      });
      it("should present the bottom sheet when the secondary action is triggered", () => {
        const { getByTestId } = renderComponent();
        const secondaryActionButton = getByTestId(
          "genericErrorSecondaryAction"
        );

        expect(secondaryActionButton).toBeTruthy();
        expect(mockPresentBottomSheet).not.toHaveBeenCalled();

        act(() => {
          fireEvent.press(secondaryActionButton);
        });

        expect(mockPresentBottomSheet).toHaveBeenCalledTimes(1);
      });
    });
    describe("generic error bottomSheet", () => {
      beforeAll(() => {
        mockErrorState({
          name: "NON_MAPPED_ERROR"
        } as unknown as (typeof unmappedErrors)[number]);
      });
      it("should match snapshot", () => {
        expect(mockedUseIOBottomSheetModal).toHaveBeenCalledTimes(0);
        renderComponent();
        expect(mockedUseIOBottomSheetModal).toHaveBeenCalledTimes(1);

        const bottomSheetComponent =
          mockedUseIOBottomSheetModal.mock.calls[0][0].component;
        expect(bottomSheetComponent).toBeDefined();
        const { toJSON } = render(bottomSheetComponent);
        expect(toJSON()).toMatchSnapshot();
      });
      it('should invoke "dismiss" on assistance press', () => {
        renderComponent();

        const bottomSheetComponent =
          mockedUseIOBottomSheetModal.mock.calls[0][0].component;
        expect(bottomSheetComponent).toBeDefined();
        const { getByTestId } = render(bottomSheetComponent);
        const assistanceButton = getByTestId("button_assistance");
        expect(assistanceButton).toBeTruthy();
        expect(mockDismissBottomSheet).not.toHaveBeenCalled();

        act(() => {
          fireEvent.press(assistanceButton);
        });

        expect(mockDismissBottomSheet).toHaveBeenCalledTimes(1);
      });
    });
  });
});

function mockReadState(readState: ReadState) {
  mockUseCieInternalAuthAndMrtdReading.mockReturnValue({
    startReading: mockStartReading,
    stopReading: mockStopReading,
    readState
  });
}

function testCancelErrorAction() {
  const { queryByText } = renderComponent();

  expect(mockStartReading).toHaveBeenCalledTimes(1);
  expect(mockStopReading).not.toHaveBeenCalled();

  const cancelAction = queryByText("global.buttons.close");

  expect(cancelAction).toBeTruthy();
  expect(mockTerminateFlow).not.toHaveBeenCalled();

  mockStartReading.mockClear();
  // If passes the previous check we can assume it exists
  fireEvent.press(cancelAction!);

  expect(mockStopReading).toHaveBeenCalledTimes(1);
  expect(mockStartReading).not.toHaveBeenCalled();
  expect(mockTerminateFlow).toHaveBeenCalledTimes(1);
}

const Component = (
  <SendAARCieCardReadingComponent {...cieCardReadingComponentProps} />
);

function renderComponent() {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);

  return renderScreenWithNavigationStoreContext(
    () => Component,
    PN_ROUTES.SEND_AAR_CIE_CARD_READING,
    {},
    store
  );
}
