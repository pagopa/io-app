import { act, fireEvent, renderHook } from "@testing-library/react-native";
import { ComponentType } from "react";
import { createStore } from "redux";
import { getType } from "typesafe-actions";
import { applicationChangeState } from "../../../../../store/actions/application";
import * as USEIO from "../../../../../store/hooks";
import { appReducer } from "../../../../../store/reducers";
import * as BS_HOOK from "../../../../../utils/hooks/bottomSheet";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { identificationRequest } from "../../../../identification/store/actions";
import PN_ROUTES from "../../../navigation/routes";
import { useSendAarDelegationProposalScreenBottomSheet } from "../useSendAarDelegationProposalScreenBottomSheet";
import {
  trackSendAarNotificationOpeningMandateBottomSheetAccepted,
  trackSendAarNotificationOpeningMandateBottomSheetClosure
} from "../../analytics";

const mockDispatch = jest.fn();
const bottomSheet = jest.spyOn(BS_HOOK, "useIOBottomSheetModal");
const identificationSuccessMock = jest.fn();
const identificationCancelMock = jest.fn();

jest.mock("../../analytics", () => ({
  trackSendAarNotificationOpeningMandateBottomSheetAccepted: jest.fn(),
  trackSendAarNotificationOpeningMandateBottomSheetClosure: jest.fn()
}));

const getBsProps = () => {
  renderHook(() =>
    useSendAarDelegationProposalScreenBottomSheet({
      citizenName: "Mario Rossi",
      onIdentificationSuccess: identificationSuccessMock,
      onIdentificationCancel: identificationCancelMock
    })
  );
  expect(bottomSheet).toHaveBeenCalledTimes(1);
  const callParameters = bottomSheet.mock.calls;
  return callParameters[0][0];
};
describe("useSendAarDelegationProposalScreenBottomSheet", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    bottomSheet.mockImplementation();
    jest.spyOn(USEIO, "useIODispatch").mockImplementation(() => mockDispatch);
  });

  it("should call useIOBottomSheetModal with valid props", async () => {
    const callParameters = getBsProps();
    expect(callParameters).toBeDefined();

    const title = callParameters.title;
    expect(title).toBeDefined();

    const component = callParameters.component;
    expect(component).toBeDefined();

    expect(title).toMatchSnapshot();
  });
  it("should render the correct BS body component, dispatch identificationRequest and track the bottom-sheet accepted event on footer button press", async () => {
    const { component } = getBsProps();
    const renderedComponent = renderComponent(() => component); // this is already a react node

    expect(renderedComponent).toBeDefined();
    expect(renderedComponent.toJSON()).toMatchSnapshot();

    const identificationCta = renderedComponent.getByTestId(
      "requestIdentification"
    );
    expect(identificationCta).toBeDefined();
    expect(mockDispatch).toHaveBeenCalledTimes(0);
    expect(
      trackSendAarNotificationOpeningMandateBottomSheetAccepted
    ).not.toHaveBeenCalled();
    expect(
      trackSendAarNotificationOpeningMandateBottomSheetClosure
    ).not.toHaveBeenCalled();

    act(() => {
      fireEvent.press(identificationCta);
    });

    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(
      trackSendAarNotificationOpeningMandateBottomSheetAccepted
    ).toHaveBeenCalledTimes(1);
    expect(
      trackSendAarNotificationOpeningMandateBottomSheetClosure
    ).not.toHaveBeenCalled();

    const dispatchArgs = mockDispatch.mock.calls[0][0];
    expect(dispatchArgs.type).toEqual(getType(identificationRequest));
    const onCancelCallback =
      dispatchArgs.payload.identificationCancelData.onCancel;
    expect(typeof onCancelCallback).toBe("function");
    const onSuccessCallback =
      dispatchArgs.payload.identificationSuccessData.onSuccess;
    expect(onSuccessCallback).toBe(identificationSuccessMock);
  });
  it("should track the bottom-sheet closure event", () => {
    const { onDismiss } = getBsProps();

    expect(
      trackSendAarNotificationOpeningMandateBottomSheetClosure
    ).not.toHaveBeenCalled();
    expect(
      trackSendAarNotificationOpeningMandateBottomSheetAccepted
    ).not.toHaveBeenCalled();

    act(() => {
      onDismiss!();
    });

    expect(
      trackSendAarNotificationOpeningMandateBottomSheetClosure
    ).toHaveBeenCalledTimes(1);
    expect(
      trackSendAarNotificationOpeningMandateBottomSheetAccepted
    ).not.toHaveBeenCalled();
  });
  it("should not track the bottom-sheet closure event if dismiss comes after the continue cta is pressed", () => {
    const { onDismiss, component } = getBsProps();

    const { getByTestId } = renderComponent(() => component); // this is already a react node

    const identificationCta = getByTestId("requestIdentification");

    expect(
      trackSendAarNotificationOpeningMandateBottomSheetClosure
    ).not.toHaveBeenCalled();
    expect(
      trackSendAarNotificationOpeningMandateBottomSheetAccepted
    ).not.toHaveBeenCalled();

    act(() => {
      fireEvent.press(identificationCta);
      onDismiss!();
    });

    expect(
      trackSendAarNotificationOpeningMandateBottomSheetAccepted
    ).toHaveBeenCalledTimes(1);
    expect(
      trackSendAarNotificationOpeningMandateBottomSheetClosure
    ).not.toHaveBeenCalled();
  });
});

const renderComponent = (ComponentToRender: ComponentType<any>) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, globalState as any);
  return renderScreenWithNavigationStoreContext(
    () => <ComponentToRender />,
    PN_ROUTES.SEND_AAR_DELEGATION_PROPOSAL,
    {},
    store
  );
};
