import * as pot from "@pagopa/ts-commons/lib/pot";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import React, { useEffect } from "react";
import I18n from "../../../i18n";
import { IOStackNavigationRouteProps } from "../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { zendeskTokenSelector } from "../../../store/reducers/authentication";
import { isStrictSome } from "../../../utils/pot";
import {
  AnonymousIdentity,
  initSupportAssistance,
  JwtIdentity,
  setUserIdentity,
  showSupportTickets,
  ZendeskAppConfig,
  zendeskDefaultAnonymousConfig,
  zendeskDefaultJwtConfig
} from "../../../utils/supportAssistance";
import { LoadingErrorComponent } from "../../bonus/bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";
import ZendeskEmptyTicketsComponent from "../components/ZendeskEmptyTicketsComponent";
import { ZendeskParamsList } from "../navigation/params";
import {
  zendeskRequestTicketNumber,
  zendeskSupportCompleted
} from "../store/actions";
import { zendeskTicketNumberSelector } from "../store/reducers";

export type ZendeskSeeReportsRoutersNavigationParams = {
  assistanceForPayment: boolean;
  assistanceForCard: boolean;
};

type Props = IOStackNavigationRouteProps<
  ZendeskParamsList,
  "ZENDESK_SEE_REPORTS_ROUTERS"
>;
/**
 * this screen checks if a user has at least a ticket, it shows:
 * - a loading state when the request start
 * - the list of the ticket if the user has at least a ticket in the history
 * - an empty request screen if the user has not ticket
 * @constructor
 */
const ZendeskSeeReportsRouters = (props: Props) => {
  const dispatch = useIODispatch();
  const zendeskToken = useIOSelector(zendeskTokenSelector);
  const ticketNumber = useIOSelector(zendeskTicketNumberSelector);
  const { assistanceForPayment, assistanceForCard } = props.route.params;

  useEffect(() => {
    const zendeskConfig = pipe(
      zendeskToken,
      O.fromNullable,
      O.map(
        (zT: string): ZendeskAppConfig => ({
          ...zendeskDefaultJwtConfig,
          token: zT
        })
      ),
      O.getOrElseW(() => zendeskDefaultAnonymousConfig)
    );

    initSupportAssistance(zendeskConfig);

    // In Zendesk we have two configuration: JwtConfig and AnonymousConfig.
    // The AnonymousConfig is used for the anonymous user.
    // Since the zendesk session token and the profile are provided by two different endpoint
    // we sequentially check both:
    // - if the zendeskToken is present the user will be authenticated via jwt
    // - nothing is available (the user is not authenticated in IO) the user will be totally anonymous also in Zendesk
    const zendeskIdentity = pipe(
      zendeskToken,
      O.fromNullable,
      O.map((zT: string): JwtIdentity | AnonymousIdentity => ({
        token: zT
      })),
      O.getOrElseW(() => ({}))
    );

    setUserIdentity(zendeskIdentity);
    dispatch(zendeskRequestTicketNumber.request());
  }, [dispatch, zendeskToken]);

  useEffect(() => {
    if (isStrictSome(ticketNumber) && ticketNumber.value > 0) {
      showSupportTickets();
      dispatch(zendeskSupportCompleted());
    }
  }, [ticketNumber, dispatch]);

  if (pot.isLoading(ticketNumber) || pot.isError(ticketNumber)) {
    return (
      <LoadingErrorComponent
        isLoading={pot.isLoading(ticketNumber)}
        loadingCaption={I18n.t("global.remoteStates.loading")}
        onRetry={() => {
          dispatch(zendeskRequestTicketNumber.request());
        }}
      />
    );
  }

  // if is some and there are 0 tickets show the Empty list component
  if (pot.isNone(ticketNumber) || ticketNumber.value === 0) {
    return (
      <ZendeskEmptyTicketsComponent
        assistanceForPayment={assistanceForPayment}
        assistanceForCard={assistanceForCard}
      />
    );
  }

  return null;
};

export default ZendeskSeeReportsRouters;
