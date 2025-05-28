import * as pot from "@pagopa/ts-commons/lib/pot";
import { identity, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as RA from "fp-ts/lib/ReadonlyArray";
import I18n from "../../../i18n";
import { PNMessage } from "../store/types/types";
import { NotificationStatus } from "../../../../definitions/pn/NotificationStatus";
import { CTAS } from "../../../types/LocalizedCTAs";
import { isServiceDetailNavigationLink } from "../../../utils/internalLink";
import { GlobalState } from "../../../store/reducers/types";
import { NotificationRecipient } from "../../../../definitions/pn/NotificationRecipient";
import { NotificationPaymentInfo } from "../../../../definitions/pn/NotificationPaymentInfo";
import { ATTACHMENT_CATEGORY } from "../../messages/types/attachmentCategory";
import { ThirdPartyAttachment } from "../../../../definitions/backend/ThirdPartyAttachment";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import { TimelineStatus } from "../components/Timeline";

export const maxVisiblePaymentCountGenerator = () => 5;

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

export const paymentsFromPNMessagePot = (
  userFiscalCode: string | undefined,
  messagePot: pot.Pot<O.Option<PNMessage>, Error>
) =>
  pipe(
    messagePot,
    pot.toOption,
    O.flatten,
    O.map(message =>
      pipe(
        message.recipients,
        RA.filterMap(paymentFromUserFiscalCodeAndRecipient(userFiscalCode))
      )
    ),
    O.toUndefined
  );

const paymentFromUserFiscalCodeAndRecipient =
  (userFiscalCode: string | undefined) =>
  (recipient: NotificationRecipient): O.Option<NotificationPaymentInfo> =>
    pipe(
      recipient.payment,
      O.fromNullable,
      O.filter(() => recipient.taxId === userFiscalCode)
    );

export const isCancelledFromPNMessagePot = (
  potMessage: pot.Pot<O.Option<PNMessage>, Error>
) =>
  pipe(
    pot.getOrElse(potMessage, O.none),
    O.chainNullableK(message => message.isCancelled),
    O.getOrElse(() => false)
  );

export const containsF24FromPNMessagePot = (
  potMessage: pot.Pot<O.Option<PNMessage>, Error>
) =>
  pipe(
    pot.getOrElse(potMessage, O.none),
    O.chainNullableK(message => message.attachments),
    O.getOrElse<ReadonlyArray<ThirdPartyAttachment>>(() => []),
    RA.some(attachment => attachment.category === ATTACHMENT_CATEGORY.F24)
  );

export const canShowMorePaymentsLink = (
  isCancelled: boolean,
  payments?: ReadonlyArray<NotificationPaymentInfo>
): payments is ReadonlyArray<NotificationPaymentInfo> =>
  !isCancelled &&
  !!payments &&
  payments.length > maxVisiblePaymentCountGenerator();

export const shouldUseBottomSheetForPayments = (
  isCancelled: boolean,
  payments?: ReadonlyArray<NotificationPaymentInfo>
): payments is ReadonlyArray<NotificationPaymentInfo> =>
  !isCancelled && (payments?.length ?? 0) > 1;
