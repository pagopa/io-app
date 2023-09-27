import * as pot from "@pagopa/ts-commons/lib/pot";
import { identity, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as RA from "fp-ts/lib/ReadonlyArray";
import I18n from "../../../i18n";
import { UIService } from "../../../store/reducers/entities/services/types";
import { PNMessage } from "../store/types/types";
import { NotificationStatus } from "../../../../definitions/pn/NotificationStatus";
import { CTAS } from "../../../types/MessageCTA";
import { isServiceDetailNavigationLink } from "../../../utils/internalLink";
import { GlobalState } from "../../../store/reducers/types";

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

export const paymentFromPNMessagePot = (
  userFiscalCode: string | undefined,
  message: pot.Pot<O.Option<PNMessage>, Error>
) =>
  pipe(
    message,
    pot.toOption,
    O.flatten,
    O.chain(message =>
      pipe(
        message.recipients,
        RA.findFirst(recipient => recipient.taxId === userFiscalCode)
      )
    ),
    O.chainNullableK(recipient => recipient.payment),
    O.toUndefined
  );

export const isCancelledFromPNMessagePot = (
  potMessage: pot.Pot<O.Option<PNMessage>, Error>
) =>
  pipe(
    pot.getOrElse(potMessage, O.none),
    O.chainNullableK(message => message.isCancelled),
    O.getOrElse(() => false)
  );
