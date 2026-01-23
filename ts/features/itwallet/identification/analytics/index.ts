import { mixpanelTrack } from "../../../../mixpanel";
import { buildEventProperties } from "../../../../utils/analytics";
import { ItwFlow, ItwScreenFlowContext } from "../../analytics/utils/types";
import {
  TrackITWalletSpidIDPSelected,
  TrackItWalletCieCardVerifyFailure,
  TrackItWalletCieCardReadingFailure,
  TrackItWalletCieCardReadingUnexpectedFailure,
  ItwUserWithoutL3requirements,
  TrackCieScreenProperties,
  TrackCieCanProperties,
  TrackItWalletErrorCardReading,
  TrackItWalletCardReadingClose,
  TrackIdMethodBottomsheetProperties
} from "./types";
import {
  ITW_IDENTIFICATION_ACTIONS_EVENTS,
  ITW_IDENTIFICATION_ERRORS_EVENTS,
  ITW_IDENTIFICATION_SCREENVIEW_EVENTS
} from "./enum";

// Screen view events

export const trackItWalletIDMethod = (itw_flow: ItwFlow) => {
  void mixpanelTrack(
    ITW_IDENTIFICATION_SCREENVIEW_EVENTS.ITW_ID_METHOD,
    buildEventProperties("UX", "screen_view", { itw_flow })
  );
};

export const trackItWalletSpidIDPSelection = (itw_flow: ItwFlow) => {
  void mixpanelTrack(
    ITW_IDENTIFICATION_SCREENVIEW_EVENTS.ITW_SPID_IDP_SELECTION,
    buildEventProperties("UX", "screen_view", { itw_flow })
  );
};

export const trackItWalletCiePinEnter = (itw_flow: ItwFlow) => {
  void mixpanelTrack(
    ITW_IDENTIFICATION_SCREENVIEW_EVENTS.ITW_CIE_PIN_ENTER,
    buildEventProperties("UX", "screen_view", { itw_flow })
  );
};

export const trackItWalletCieNfcActivation = (itw_flow: ItwFlow) => {
  void mixpanelTrack(
    ITW_IDENTIFICATION_SCREENVIEW_EVENTS.ITW_CIE_NFC_ACTIVATION,
    buildEventProperties("UX", "screen_view", { itw_flow })
  );
};

export const trackItWalletCieCardReading = (
  properties: TrackCieScreenProperties
) => {
  void mixpanelTrack(
    ITW_IDENTIFICATION_SCREENVIEW_EVENTS.ITW_CIE_CARD_READING,
    buildEventProperties("UX", "screen_view", properties)
  );
};

export const trackItWalletCieCardReadingSuccess = (
  properties: TrackCieScreenProperties
) => {
  void mixpanelTrack(
    ITW_IDENTIFICATION_SCREENVIEW_EVENTS.ITW_CARD_READING_SUCCESS,
    buildEventProperties("UX", "screen_view", properties)
  );
};

export const trackItwPinInfoBottomSheet = (
  screenFlowContext: ItwScreenFlowContext
) => {
  void mixpanelTrack(
    ITW_IDENTIFICATION_SCREENVIEW_EVENTS.ITW_PIN_INFO_BOTTOMSHEET,
    buildEventProperties("UX", "screen_view", screenFlowContext)
  );
};

export const trackItwCieInfoBottomSheet = (
  screenFlowContext: ItwScreenFlowContext
) => {
  void mixpanelTrack(
    ITW_IDENTIFICATION_SCREENVIEW_EVENTS.ITW_CIE_INFO_BOTTOMSHEET,
    buildEventProperties("UX", "screen_view", screenFlowContext)
  );
};

export const trackItwCiePinTutorialCie = (
  properties: TrackCieScreenProperties
) => {
  void mixpanelTrack(
    ITW_IDENTIFICATION_SCREENVIEW_EVENTS.ITW_CIE_PIN_TUTORIAL_CIE,
    buildEventProperties("UX", "screen_view", properties)
  );
};

export const trackItwCiePinTutorialPin = (itw_flow: ItwFlow) => {
  void mixpanelTrack(
    ITW_IDENTIFICATION_SCREENVIEW_EVENTS.ITW_CIE_PIN_TUTORIAL_PIN,
    buildEventProperties("UX", "screen_view", { itw_flow })
  );
};

export const trackItwIdCieCanTutorialCan = (
  properties: TrackCieCanProperties
) => {
  void mixpanelTrack(
    ITW_IDENTIFICATION_SCREENVIEW_EVENTS.ITW_ID_CIE_CAN_TUTORIAL_CAN,
    buildEventProperties("UX", "screen_view", properties)
  );
};

export const trackItwIdEnterCan = (properties: TrackCieCanProperties) => {
  void mixpanelTrack(
    ITW_IDENTIFICATION_SCREENVIEW_EVENTS.ITW_ID_ENTER_CAN,
    buildEventProperties("UX", "screen_view", properties)
  );
};

export const trackItwUserWithoutL3Bottomsheet = () => {
  void mixpanelTrack(
    ITW_IDENTIFICATION_SCREENVIEW_EVENTS.ITW_USER_WITHOUT_L3_BOTTOMSHEET,
    buildEventProperties("UX", "screen_view")
  );
};

export const trackItwIdMethodBottomsheet = (
  properties: TrackIdMethodBottomsheetProperties
) => {
  void mixpanelTrack(
    ITW_IDENTIFICATION_SCREENVIEW_EVENTS.ITW_ID_METHOD_BOTTOMSHEET,
    buildEventProperties("UX", "screen_view", properties)
  );
};

// Actions events

export const trackItWalletSpidIDPSelected = (
  properties: TrackITWalletSpidIDPSelected
) => {
  void mixpanelTrack(
    ITW_IDENTIFICATION_ACTIONS_EVENTS.ITW_SPID_IDP_SELECTED,
    buildEventProperties("UX", "action", properties)
  );
};

export const trackItWalletCiePinInfo = (itw_flow: ItwFlow) => {
  void mixpanelTrack(
    ITW_IDENTIFICATION_ACTIONS_EVENTS.ITW_CIE_PIN_INFO,
    buildEventProperties("UX", "action", { itw_flow })
  );
};

export const trackItWalletCiePinForgotten = (itw_flow: ItwFlow) => {
  void mixpanelTrack(
    ITW_IDENTIFICATION_ACTIONS_EVENTS.ITW_CIE_PIN_FORGOTTEN,
    buildEventProperties("UX", "action", { itw_flow })
  );
};

export const trackItWalletCiePukForgotten = (itw_flow: ItwFlow) => {
  void mixpanelTrack(
    ITW_IDENTIFICATION_ACTIONS_EVENTS.ITW_CIE_PUK_FORGOTTEN,
    buildEventProperties("UX", "action", { itw_flow })
  );
};

export const trackItWalletCieNfcGoToSettings = (itw_flow: ItwFlow) => {
  void mixpanelTrack(
    ITW_IDENTIFICATION_ACTIONS_EVENTS.ITW_CIE_NFC_GO_TO_SETTINGS,
    buildEventProperties("UX", "action", { itw_flow })
  );
};

export const trackItwIdMethodBottomsheetClose = (
  properties: TrackIdMethodBottomsheetProperties
) => {
  void mixpanelTrack(
    ITW_IDENTIFICATION_ACTIONS_EVENTS.ITW_ID_METHOD_BOTTOMSHEET_CLOSE,
    buildEventProperties("UX", "action", properties)
  );
};

export const trackItwIdMethodBottomsheetContinue = (
  properties: TrackIdMethodBottomsheetProperties
) => {
  void mixpanelTrack(
    ITW_IDENTIFICATION_ACTIONS_EVENTS.ITW_ID_METHOD_BOTTOMSHEET_CONTINUE,
    buildEventProperties("UX", "action", properties)
  );
};

// Errors events

export const trackItWalletErrorCardReading = (
  properties: TrackItWalletErrorCardReading
) => {
  void mixpanelTrack(
    ITW_IDENTIFICATION_ERRORS_EVENTS.ITW_CIE_CARD_READING_ERROR,
    buildEventProperties("UX", "error", properties)
  );
};

export const trackItWalletErrorPin = (
  itw_flow: ItwFlow,
  cie_reading_progress: number
) => {
  void mixpanelTrack(
    ITW_IDENTIFICATION_ERRORS_EVENTS.ITW_CIE_PIN_ERROR,
    buildEventProperties("UX", "error", { itw_flow, cie_reading_progress })
  );
};

export const trackItWalletSecondErrorPin = (
  itw_flow: ItwFlow,
  cie_reading_progress: number
) => {
  void mixpanelTrack(
    ITW_IDENTIFICATION_ERRORS_EVENTS.ITW_CIE_PIN_SECOND_ERROR,
    buildEventProperties("UX", "error", { itw_flow, cie_reading_progress })
  );
};

export const trackItWalletLastErrorPin = (
  itw_flow: ItwFlow,
  cie_reading_progress: number
) => {
  void mixpanelTrack(
    ITW_IDENTIFICATION_ERRORS_EVENTS.ITW_CIE_PIN_LAST_ERROR,
    buildEventProperties("UX", "error", { itw_flow, cie_reading_progress })
  );
};

export const trackItWalletCardReadingClose = (
  properties: TrackItWalletCardReadingClose
) => {
  void mixpanelTrack(
    ITW_IDENTIFICATION_ERRORS_EVENTS.ITW_CIE_CARD_READING_CLOSE,
    buildEventProperties("UX", "error", properties)
  );
};

export const trackItWalletCieCardVerifyFailure = (
  properties: TrackItWalletCieCardVerifyFailure
) => {
  void mixpanelTrack(
    ITW_IDENTIFICATION_ERRORS_EVENTS.ITW_CIE_CARD_VERIFY_FAILURE,
    buildEventProperties("UX", "error", properties)
  );
};

export const trackItWalletCieCardReadingFailure = (
  properties: TrackItWalletCieCardReadingFailure
) => {
  void mixpanelTrack(
    ITW_IDENTIFICATION_ERRORS_EVENTS.ITW_CIE_CARD_READING_FAILURE,
    buildEventProperties("UX", "error", properties)
  );
};

export const trackItWalletCieCardReadingUnexpectedFailure = (
  properties: TrackItWalletCieCardReadingUnexpectedFailure
) => {
  void mixpanelTrack(
    ITW_IDENTIFICATION_ERRORS_EVENTS.ITW_CIE_CARD_READING_UNEXPECTED_FAILURE,
    buildEventProperties("KO", "error", properties)
  );
};

export const trackItwUserWithoutL3Requirements = (
  itwUserWithoutL3requirements: ItwUserWithoutL3requirements
) => {
  void mixpanelTrack(
    ITW_IDENTIFICATION_ERRORS_EVENTS.ITW_USER_WITHOUT_L3_REQUIREMENTS,
    buildEventProperties("KO", "screen_view", itwUserWithoutL3requirements)
  );
};
