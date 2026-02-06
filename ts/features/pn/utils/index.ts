import { identity, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import I18n from "i18next";
import { PNMessage } from "../store/types/types";
import { NotificationStatus } from "../../../../definitions/pn/NotificationStatus";
import { CTAS } from "../../../types/LocalizedCTAs";
import { isServiceDetailNavigationLink } from "../../../utils/internalLink";
import { GlobalState } from "../../../store/reducers/types";
import { NotificationPaymentInfo } from "../../../../definitions/pn/NotificationPaymentInfo";
import { ATTACHMENT_CATEGORY } from "../../messages/types/attachmentCategory";
import { TimelineStatus } from "../components/Timeline";
import { SendOpeningSource } from "../../pushNotifications/analytics";
import { ServiceId } from "../../../../definitions/services/ServiceId";

export const maxVisiblePaymentCount = 5;

export const getNotificationStatusInfo = (status: NotificationStatus) =>
  I18n.t(`features.pn.details.timeline.status.${status}`, {
    defaultValue: status
  });

export const notificationStatusToTimelineStatus = (
  status: NotificationStatus
): TimelineStatus => {
  switch (status) {
    case "VIEWED":
      return "viewed";
    case "EFFECTIVE_DATE":
      return "effective";
    case "UNREACHABLE":
      return "unreachable";
    case "CANCELLED":
      return "cancelled";
  }
  return "default";
};

export type PNOptInMessageInfo = {
  isPNOptInMessage: boolean;
  cta1LinksToPNService: boolean;
  cta2LinksToPNService: boolean;
};

export const extractPNOptInMessageInfoIfAvailable = (
  ctasOpt: CTAS | undefined,
  serviceIdOpt: ServiceId | undefined,
  state: GlobalState
) =>
  pipe(
    serviceIdOpt,
    O.fromNullable,
    O.chain(serviceId =>
      pipe(
        state.remoteConfig,
        O.map(remoteConfig => remoteConfig.pn.optInServiceId === serviceId)
      )
    ),
    O.filter(identity),
    O.chain(() =>
      pipe(
        ctasOpt,
        O.fromNullable,
        O.map(ctas => ({
          cta1LinksToPNService: isServiceDetailNavigationLink(
            ctas.cta_1.action
          ),
          cta2LinksToPNService:
            !!ctas.cta_2 && isServiceDetailNavigationLink(ctas.cta_2.action)
        })),
        O.map(ctaNavigationLinkInfo => ({
          isPNOptInMessage:
            ctaNavigationLinkInfo.cta1LinksToPNService ||
            ctaNavigationLinkInfo.cta2LinksToPNService,
          ...ctaNavigationLinkInfo
        }))
      )
    ),
    O.getOrElse<PNOptInMessageInfo>(() => ({
      isPNOptInMessage: false,
      cta1LinksToPNService: false,
      cta2LinksToPNService: false
    }))
  );

export const paymentsFromSendMessage = (
  userFiscalCode: string | undefined,
  sendMessage: PNMessage | undefined
): ReadonlyArray<NotificationPaymentInfo> | undefined => {
  if (sendMessage == null) {
    return undefined;
  }

  const recipients = sendMessage.recipients;
  const filteredPayments = recipients.reduce<
    ReadonlyArray<NotificationPaymentInfo>
  >((accumulator, recipient) => {
    if (
      // Payment must be defined
      recipient.payment != null &&
      // Payment is valid if no input fiscal code to compare to has been provided
      // or if the taxId property matches the provided userFiscalCode
      (userFiscalCode == null || recipient.taxId === userFiscalCode)
    ) {
      return [...accumulator, recipient.payment];
    }
    return accumulator;
  }, []);
  return filteredPayments.length > 0 ? filteredPayments : undefined;
};

export const isSENDMessageCancelled = (sendMessage: PNMessage | undefined) =>
  sendMessage?.isCancelled ?? false;

export const doesSENDMessageIncludeF24 = (sendMessage: PNMessage | undefined) =>
  sendMessage?.attachments?.some(
    attachment => attachment.category === ATTACHMENT_CATEGORY.F24
  ) ?? false;

export const canShowMorePaymentsLink = (
  isCancelled: boolean,
  payments?: ReadonlyArray<NotificationPaymentInfo>
): payments is ReadonlyArray<NotificationPaymentInfo> =>
  !isCancelled && !!payments && payments.length > maxVisiblePaymentCount;

export const shouldUseBottomSheetForPayments = (
  isCancelled: boolean,
  payments?: ReadonlyArray<NotificationPaymentInfo>
): payments is ReadonlyArray<NotificationPaymentInfo> =>
  !isCancelled && (payments?.length ?? 0) > 1;

export const openingSourceIsAarMessage = (openingSource: SendOpeningSource) =>
  openingSource === "aar";
