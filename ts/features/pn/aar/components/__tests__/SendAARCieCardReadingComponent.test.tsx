import { fireEvent, render } from "@testing-library/react-native";
import { omit } from "lodash";
import {
  SendAARCieCardReadingComponent,
  SendAARCieCardReadingComponentProps
} from "../SendAARCieCardReadingComponent";
import {
  ReadStatus,
  useCieInternalAuthAndMrtdReading
} from "../../hooks/useCieInternalAuthAndMrtdReading";
import { setAarFlowState } from "../../store/actions";
import { sendAARFlowStates } from "../../utils/stateUtils";

type ReadState = ReturnType<
  typeof useCieInternalAuthAndMrtdReading
>["readState"];
type ErrorState = Extract<ReadState, { status: ReadStatus.ERROR }>;

const mockStartReading = jest.fn();
const mockStopReading = jest.fn();
const mockDispatch = jest.fn();
const mockTerminateFlow = jest.fn();

jest.mock("react-redux", () => ({
  useDispatch: () => mockDispatch
}));
jest.mock("@react-navigation/native");
jest.mock("@react-navigation/stack", () => ({
  createStackNavigator: jest.fn()
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

describe("SendAARCieCardReadingComponent", () => {
  afterEach(jest.clearAllMocks);

  it.each<ReadState>([
    { status: ReadStatus.IDLE },
    { status: ReadStatus.READING, progress: 0 },
    { status: ReadStatus.READING, progress: 0.5 },
    { status: ReadStatus.READING, progress: 1 },
    { status: ReadStatus.SUCCESS, data: successDataMock },
    ...errorsMock.map<ReadState>(error => ({ status: ReadStatus.ERROR, error }))
  ])("should match the snapshot for readState: %o", readState => {
    mockReadState(readState);

    const component = renderComponent();

    expect(component).toMatchSnapshot();
  });

  describe("SendAARCieCardReadingComponent: ReadState is IDLE", () => {
    beforeEach(() => {
      mockReadState({ status: ReadStatus.IDLE });
    });

    it('should invoke "startReading" only once', () => {
      const { rerender } = renderComponent();

      rerender(<Component />);

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
    it(
      'should invoke "stopReading" when the cancelAction is triggered',
      testCancelAction
    );
    it('should invoke "startReading" only once despite transition from IDLE state to READING state', () => {
      const { rerender } = renderComponent();

      mockReadState({ status: ReadStatus.READING, progress: 0.2 });

      rerender(<Component />);

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
    it(
      'should invoke "stopReading" when the cancelAction is triggered',
      testCancelAction
    );
    it('should invoke "startReading" only once despite transition from READING state to SUCCESS state', () => {
      const { rerender } = renderComponent();

      mockReadState({ status: ReadStatus.SUCCESS, data: successDataMock });

      rerender(<Component />);

      expect(mockStartReading).toHaveBeenCalledTimes(1);
    });
    it('should invoke "startReading" only once despite transition from READING state to ERROR state', () => {
      const { rerender } = renderComponent();

      mockReadState({ status: ReadStatus.ERROR, error: errorsMock[0] });

      rerender(<Component />);

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
      beforeAll(() => {
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

        // If passes the previous check we can assume it exists
        fireEvent.press(retryAction!);

        expect(mockStartReading).toHaveBeenCalledTimes(1);
        expect(mockStopReading).not.toHaveBeenCalled();
      });
      it(
        'should invoke "stopReading" when the cancel action is triggered',
        testCancelAction
      );
    });
    // TODO: [IOCOM-2752] Handle errors
    describe.each(unmappedErrors)("$name error", error => {
      beforeAll(() => {
        mockErrorState(error);
      });
      it("should output the right title", () => {
        const { queryByText } = renderComponent();

        expect(queryByText("Qualcosa è andato storto.")).toBeTruthy();
      });
      it('should invoke "terminateFlow" when close action in tapped', () => {
        const { queryByText } = renderComponent();

        // reset the mock triggered on component mount
        mockStartReading.mockClear();

        const closeAction = queryByText("global.buttons.close");
        expect(closeAction).toBeTruthy();

        // If passes the previous check we can assume it exists
        fireEvent.press(closeAction!);

        expect(mockTerminateFlow).toHaveBeenCalledTimes(1);
        expect(mockStartReading).not.toHaveBeenCalled();
        expect(mockStopReading).not.toHaveBeenCalled();
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

function testCancelAction() {
  const { queryByText } = renderComponent();

  expect(mockStartReading).toHaveBeenCalledTimes(1);
  expect(mockStopReading).not.toHaveBeenCalled();

  const cancelAction = queryByText("global.buttons.close");

  expect(cancelAction).toBeTruthy();

  mockStartReading.mockClear();
  // If passes the previous check we can assume it exists
  fireEvent.press(cancelAction!);

  expect(mockStopReading).toHaveBeenCalledTimes(1);
  expect(mockStartReading).not.toHaveBeenCalled();
}

function Component() {
  return <SendAARCieCardReadingComponent {...cieCardReadingComponentProps} />;
}

function renderComponent() {
  return render(<Component />);
}
