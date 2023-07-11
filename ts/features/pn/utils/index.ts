import { identity, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import I18n from "../../../i18n";
import { UIService } from "../../../store/reducers/entities/services/types";
import { NotificationStatus } from "../store/types/types";
import { CTAS } from "../../../types/MessageCTA";
import { isServiceDetailNavigationLink } from "../../../utils/internalLink";
import { GlobalState } from "../../../store/reducers/types";

export function getNotificationStatusInfo(status: NotificationStatus) {
  return I18n.t(`features.pn.details.timeline.status.${status}`, {
    defaultValue: status
  });
}

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
        O.map(
          ctas =>
            isServiceDetailNavigationLink(ctas.cta_1.action) ||
            (!!ctas.cta_2 && isServiceDetailNavigationLink(ctas.cta_2.action))
        )
      )
    ),
    O.getOrElse(() => false)
  );
