import * as pot from "@pagopa/ts-commons/lib/pot";
import { useNavigation } from "@react-navigation/native";
import { fromNullable } from "fp-ts/lib/Option";
import React, { useEffect } from "react";
import { SafeAreaView } from "react-native";
import { useDispatch } from "react-redux";
import image from "../../../../img/pictograms/doubt.png";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import { renderInfoRasterImage } from "../../../components/infoScreen/imageRendering";
import { InfoScreenComponent } from "../../../components/infoScreen/InfoScreenComponent";
import I18n from "../../../i18n";
import {
  AppParamsList,
  IOStackNavigationProp,
  IOStackNavigationRouteProps
} from "../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../store/hooks";
import { zendeskTokenSelector } from "../../../store/reducers/authentication";
import { isStrictSome } from "../../../utils/pot";
import {
  AnonymousIdentity,
  initSupportAssistance,
  isPanicModeActive,
  JwtIdentity,
  setUserIdentity,
  showSupportTickets,
  ZendeskAppConfig,
  zendeskDefaultAnonymousConfig,
  zendeskDefaultJwtConfig
} from "../../../utils/supportAssistance";
import { FooterStackButton } from "../../bonus/bonusVacanze/components/buttons/FooterStackButtons";
import { LoadingErrorComponent } from "../../bonus/bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";
import { isReady } from "../../bonus/bpd/model/RemoteValue";
import { ZendeskParamsList } from "../navigation/params";
import {
  zendeskRequestTicketNumber,
  zendeskSupportCompleted
} from "../store/actions";
import {
  zendeskConfigSelector,
  zendeskTicketNumberSelector
} from "../store/reducers";

export type ZendeskSeeReportsRoutersNavigationParams = {
  assistanceForPayment: boolean;
};

type EmptyTicketsProps = {
  assistanceForPayment: boolean;
};

const EmptyTicketsComponent = ({ assistanceForPayment }: EmptyTicketsProps) => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const zendeskRemoteConfig = useIOSelector(zendeskConfigSelector);

  const handleContactSupportPress = () => {
    const canSkipCategoryChoice: boolean =
      !isReady(zendeskRemoteConfig) || assistanceForPayment;

    if (isPanicModeActive(zendeskRemoteConfig)) {
      // Go to panic mode screen
      navigation.navigate("ZENDESK_MAIN", {
        screen: "ZENDESK_PANIC_MODE"
      });
      return;
    }

    if (canSkipCategoryChoice) {
      navigation.navigate("ZENDESK_MAIN", {
        screen: "ZENDESK_ASK_PERMISSIONS",
        params: { assistanceForPayment }
      });
    } else {
      navigation.navigate("ZENDESK_MAIN", {
        screen: "ZENDESK_CHOOSE_CATEGORY",
        params: { assistanceForPayment }
      });
    }
  };

  const continueButtonProps = {
    testID: "continueButtonId",
    bordered: false,
    onPress: handleContactSupportPress,
    title: I18n.t("support.helpCenter.cta.contactSupport")
  };

  const cancelButtonProps = {
    testID: "cancelButtonId",
    bordered: true,
    onPress: () => navigation.goBack(),
    title: I18n.t("global.buttons.back")
  };

  return (
    <SafeAreaView style={IOStyles.flex} testID={"emptyTicketsComponent"}>
      <InfoScreenComponent
        image={renderInfoRasterImage(image)}
        title={I18n.t("support.ticketList.noTicket.title")}
        body={I18n.t("support.ticketList.noTicket.body")}
      />
      <FooterStackButton buttons={[continueButtonProps, cancelButtonProps]} />
    </SafeAreaView>
  );
};

type Props = IOStackNavigationRouteProps<
  ZendeskParamsList,
  "ZENDESK_ASK_SEE_REPORTS_PERMISSIONS"
>;
/**
 * this screen checks if a user has at least a ticket, it shows:
 * - a loading state when the request start
 * - the list of the ticket if the user has at least a ticket in the history
 * - an empty request screen if the user has not ticket
 * @constructor
 */
const ZendeskSeeReportsRouters = (props: Props) => {
  const dispatch = useDispatch();
  const zendeskToken = useIOSelector(zendeskTokenSelector);
  const ticketNumber = useIOSelector(zendeskTicketNumberSelector);
  const assistanceForPayment = props.route.params.assistanceForPayment;

  const [zendeskConfig, setZendeskConfig] = React.useState<ZendeskAppConfig>(
    zendeskToken
      ? { ...zendeskDefaultJwtConfig, token: zendeskToken }
      : zendeskDefaultAnonymousConfig
  );

  useEffect(() => {
    setZendeskConfig(
      zendeskToken
        ? { ...zendeskDefaultJwtConfig, token: zendeskToken }
        : zendeskDefaultAnonymousConfig
    );
  }, [zendeskToken]);

  useEffect(() => {
    initSupportAssistance(zendeskConfig);

    // In Zendesk we have two configuration: JwtConfig and AnonymousConfig.
    // The AnonymousConfig is used for the anonymous user.
    // Since the zendesk session token and the profile are provided by two different endpoint
    // we sequentially check both:
    // - if the zendeskToken is present the user will be authenticated via jwt
    // - nothing is available (the user is not authenticated in IO) the user will be totally anonymous also in Zendesk
    const zendeskIdentity = fromNullable(zendeskToken)
      .map((zT: string): JwtIdentity | AnonymousIdentity => ({
        token: zT
      }))
      .getOrElse({});

    setUserIdentity(zendeskIdentity);
    dispatch(zendeskRequestTicketNumber.request());
  }, [dispatch, zendeskConfig, zendeskToken]);

  useEffect(() => {
    if (ticketNumber.kind === "PotSome" && ticketNumber.value > 0) {
      showSupportTickets();
      dispatch(zendeskSupportCompleted());
    }
  }, [ticketNumber, dispatch]);

  if (!isStrictSome(ticketNumber) && !pot.isNone(ticketNumber)) {
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

  // if is some and there are 0 tickets show the
  if (pot.isNone(ticketNumber) || ticketNumber.value === 0) {
    return (
      <EmptyTicketsComponent assistanceForPayment={assistanceForPayment} />
    );
  }

  return null;
};

export default ZendeskSeeReportsRouters;
