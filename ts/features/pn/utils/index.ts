import * as pot from "@pagopa/ts-commons/lib/pot";
import { identity, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as E from "fp-ts/lib/Either";
import * as RA from "fp-ts/lib/ReadonlyArray";
import { RptIdFromString } from "@pagopa/io-pagopa-commons/lib/pagopa";
import { Dispatch } from "redux";
import I18n from "../../../i18n";
import { UIService } from "../../../store/reducers/entities/services/types";
import { PNMessage } from "../store/types/types";
import { NotificationStatus } from "../../../../definitions/pn/NotificationStatus";
import { CTAS } from "../../messages/types/MessageCTA";
import { isServiceDetailNavigationLink } from "../../../utils/internalLink";
import { GlobalState } from "../../../store/reducers/types";
import { NotificationRecipient } from "../../../../definitions/pn/NotificationRecipient";
import { NotificationPaymentInfo } from "../../../../definitions/pn/NotificationPaymentInfo";
import { paymentInitializeState } from "../../../store/actions/wallet/payment";
import NavigationService from "../../../navigation/NavigationService";
import ROUTES from "../../../navigation/routes";
import { setSelectedPayment } from "../store/actions";
import { trackPNPaymentStart } from "../analytics";
import { ATTACHMENT_CATEGORY } from "../../messages/types/attachmentCategory";
import { UIAttachment } from "../../messages/types";

export const maxVisiblePaymentCountGenerator = () => 5;

export function getNotificationStatusInfo(status: NotificationStatus) {
  return I18n.t(`features.pn.details.timeline.status.${status}`, {
    defaultValue: status
  });
}

export type PNOptInMessageInfo = {
  isPNOptInMessage: boolean;
  cta1HasServiceNavigationLink: boolean;
  cta2HasServiceNavigationLink: boolean;
};

export const isPNOptInMessage = (
  maybeCtas: O.Option<CTAS>,
  service: UIService | undefined,
  state: GlobalState
) =>
  pipe(
    service,
    O.fromNullable,
    O.chain(service =>
      pipe(
        state.backendStatus.status,
        O.map(
          backendStatus => backendStatus.config.pn.optInServiceId === service.id
        )
      )
    ),
    O.filter(identity),
    O.chain(_ =>
      pipe(
        maybeCtas,
        O.map(ctas => ({
          cta1HasServiceNavigationLink: isServiceDetailNavigationLink(
            ctas.cta_1.action
          ),
          cta2HasServiceNavigationLink:
            !!ctas.cta_2 && isServiceDetailNavigationLink(ctas.cta_2.action)
        })),
        O.map(
          ctaNavigationLinkInfo =>
            ({
              isPNOptInMessage:
                ctaNavigationLinkInfo.cta1HasServiceNavigationLink ||
                ctaNavigationLinkInfo.cta2HasServiceNavigationLink,
              ...ctaNavigationLinkInfo
            } as PNOptInMessageInfo)
        )
      )
    ),
    O.getOrElse(
      () =>
        ({
          isPNOptInMessage: false,
          cta1HasServiceNavigationLink: false,
          cta2HasServiceNavigationLink: false
        } as PNOptInMessageInfo)
    )
  );

export const paymentsFromPNMessagePot = (
  userFiscalCode: string | undefined,
  message: pot.Pot<O.Option<PNMessage>, Error>
) =>
  pipe(
    message,
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
    O.getOrElse<ReadonlyArray<UIAttachment>>(() => []),
    RA.some(attachment => attachment.category === ATTACHMENT_CATEGORY.F24)
  );

export const initializeAndNavigateToWalletForPayment = (
  paymentId: string,
  dispatch: Dispatch<any>,
  decodeErrorCallback: (() => void) | undefined,
  preNavigationCallback: (() => void) | undefined = undefined
) => {
  const eitherRptId = RptIdFromString.decode(paymentId);
  if (E.isLeft(eitherRptId)) {
    decodeErrorCallback?.();
    return;
  }

  preNavigationCallback?.();

  trackPNPaymentStart();

  dispatch(setSelectedPayment(paymentId));
  dispatch(paymentInitializeState());

  NavigationService.navigate(ROUTES.WALLET_NAVIGATOR, {
    screen: ROUTES.PAYMENT_TRANSACTION_SUMMARY,
    params: { rptId: eitherRptId.right, startOrigin: "message" }
  });
};
