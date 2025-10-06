import { AARFlowState, sendAARFlowStates } from "./stateUtils";

export const sendAarMockStateFactory: Record<
  AARFlowState["type"],
  () => AARFlowState
> = {
  none: () => ({ type: "none" }),
  displayingAARToS: () => ({
    type: "displayingAARToS",
    qrCode: "https://www.google.com"
  }),
  fetchingQRData: () => ({
    type: "fetchingQRData",
    qrCode: "https://www.google.com"
  }),
  fetchingNotificationData: () => ({
    type: "fetchingNotificationData",
    iun: "000000000001",
    fullNameDestinatario: "Mario Rossi"
  }),
  displayingNotificationData: () => ({
    type: "displayingNotificationData",
    fullNameDestinatario: "Mario Rossi",
    notification: {}
  }),
  notAddresseeFinal: () => ({
    type: "notAddresseeFinal",
    fullNameDestinatario: "Mario Rossi",
    qrCode: "https://www.google.com",
    iun: "000000000001"
  }),
  ko: () => ({
    type: "ko",
    previousState: { type: "none" }
  })
};

export const sendAarStateNames = Object.values(sendAARFlowStates);
export const sendAarMockStates = sendAarStateNames.map(t =>
  sendAarMockStateFactory[t]()
);
