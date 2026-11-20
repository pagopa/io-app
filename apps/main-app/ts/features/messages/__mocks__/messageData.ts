import { ServiceId } from "@io-app/api-types/generated/definitions/services/ServiceId";

import { SuccessGetMessageDataActionType } from "../store/actions";

/**
 * Data of a loaded standard message, as carried by
 * `getMessageDataAction.success`.
 */
export const successGetMessageDataFor = (
  messageId: string,
  overrides: Partial<Omit<SuccessGetMessageDataActionType, "messageId">> = {}
): SuccessGetMessageDataActionType => ({
  messageId,
  serviceId: "01JK8TKP8QCNJ689M4D94VA6VG" as ServiceId,
  serviceName: "serName",
  organizationName: "orgName",
  organizationFiscalCode: "orgFisCod",
  firstTimeOpening: true,
  containsAttachments: false,
  hasRemoteContent: false,
  hasFIMSCTA: false,
  isLegacyGreenPass: false,
  isPNMessage: false,
  createdAt: new Date("2025-01-01T10:30:45.000Z"),
  fciMessageType: "not_set",
  fciResult: "not_set",
  ...overrides
});
