import * as pot from "@pagopa/ts-commons/lib/pot";
import { useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect } from "react";
import LoadingScreenContent from "../../../components/screens/LoadingScreenContent";
import { OperationResultScreenContent } from "../../../components/screens/OperationResultScreenContent";
import I18n from "../../../i18n";
import {
  AppParamsList,
  IOStackNavigationProp,
  IOStackNavigationRouteProps
} from "../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { zendeskTokenSelector } from "../../../store/reducers/authentication";
import { isStrictSome } from "../../../utils/pot";
import {
  getZendeskConfig,
  getZendeskIdentity,
  initSupportAssistance,
  setUserIdentity,
  showSupportTickets
} from "../../../utils/supportAssistance";
import { ZendeskParamsList } from "../navigation/params";
import {
  zendeskRequestTicketNumber,
  zendeskStopPolling,
  zendeskSupportCompleted
} from "../store/actions";
import {
  zendeskConfigSelector,
  zendeskTicketNumberSelector
} from "../store/reducers";
import { handleContactSupport } from "../utils";

export type ZendeskSeeReportsRoutersNavigationParams = {
  assistanceForPayment: boolean;
  assistanceForCard: boolean;
  assistanceForFci: boolean;
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
  const { assistanceForPayment, assistanceForCard, assistanceForFci } =
    props.route.params;
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const zendeskRemoteConfig = useIOSelector(zendeskConfigSelector);

  const dispatchZendeskUiDismissed = useCallback(
    () => dispatch(zendeskStopPolling()),
    [dispatch]
  );

  useEffect(() => {
    const zendeskConfig = getZendeskConfig(zendeskToken);
    initSupportAssistance(zendeskConfig);

    // In Zendesk we have two configuration: JwtConfig and AnonymousConfig.
    // The AnonymousConfig is used for the anonymous user.
    // Since the zendesk session token and the profile are provided by two different endpoint
    // we sequentially check both:
    // - if the zendeskToken is present the user will be authenticated via jwt
    // - nothing is available (the user is not authenticated in IO) the user will be totally anonymous also in Zendesk
    const zendeskIdentity = getZendeskIdentity(zendeskToken);
    setUserIdentity(zendeskIdentity);
    dispatch(zendeskRequestTicketNumber.request());
  }, [dispatch, zendeskToken]);

  const handleContactSupportPress = React.useCallback(
    () =>
      handleContactSupport(
        navigation,
        assistanceForPayment,
        assistanceForCard,
        assistanceForFci,
        zendeskRemoteConfig
      ),
    [
      navigation,
      assistanceForPayment,
      assistanceForCard,
      assistanceForFci,
      zendeskRemoteConfig
    ]
  );

  useEffect(() => {
    if (isStrictSome(ticketNumber) && ticketNumber.value > 0) {
      showSupportTickets(() => dispatchZendeskUiDismissed());
      dispatch(zendeskSupportCompleted());
    }
  }, [ticketNumber, dispatch, dispatchZendeskUiDismissed]);

  if (pot.isLoading(ticketNumber)) {
    return (
      <LoadingScreenContent
        contentTitle={I18n.t("global.remoteStates.loading")}
      />
    );
  }

  if (pot.isError(ticketNumber)) {
    return (
      <OperationResultScreenContent
        pictogram={"umbrellaNew"}
        title={I18n.t("global.genericError")}
        action={{
          label: I18n.t("global.buttons.retry"),
          onPress: () => {
            dispatch(zendeskRequestTicketNumber.request());
          }
        }}
        secondaryAction={{
          label: I18n.t("global.buttons.back"),
          onPress: () => props.navigation.goBack()
        }}
      />
    );
  }

  // if is some and there are 0 tickets show the specific empty state
  if (pot.isNone(ticketNumber) || ticketNumber.value === 0) {
    return (
      <OperationResultScreenContent
        testID={"emptyTicketsComponent"}
        pictogram={"help"}
        title={I18n.t("support.ticketList.noTicket.title")}
        subtitle={I18n.t("support.ticketList.noTicket.body")}
        action={{
          label: I18n.t("support.helpCenter.cta.contactSupport"),
          onPress: handleContactSupportPress,
          testID: "continueButtonId"
        }}
        secondaryAction={{
          label: I18n.t("global.buttons.back"),
          onPress: () => navigation.goBack(),
          testID: "cancelButtonId"
        }}
      />
    );
  }

  return null;
};

export default ZendeskSeeReportsRouters;
