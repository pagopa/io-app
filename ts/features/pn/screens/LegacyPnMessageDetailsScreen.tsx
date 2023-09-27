import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import * as React from "react";
import { SafeAreaView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { RptId } from "@pagopa/io-pagopa-commons/lib/pagopa";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";

import { ServiceId } from "../../../../definitions/backend/ServiceId";
import { ServicePublic } from "../../../../definitions/backend/ServicePublic";
import I18n from "../../../i18n";
import { IOStackNavigationRouteProps } from "../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { UIMessageId } from "../../../store/reducers/entities/messages/types";
import { serviceByIdSelector } from "../../../store/reducers/entities/services/servicesById";
import { emptyContextualHelp } from "../../../utils/emptyContextualHelp";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";
import { MessageLoading } from "../../messages/components/MessageLoading";
import { loadThirdPartyMessage } from "../../messages/store/actions";
import { LegacyPnMessageDetails } from "../components/LegacyPnMessageDetails";
import { PnMessageDetailsError } from "../components/PnMessageDetailsError";
import { PnParamsList } from "../navigation/params";
import { pnMessageFromIdSelector } from "../store/reducers";
import { PNMessage } from "../store/types/types";
import { NotificationPaymentInfo } from "../../../../definitions/pn/NotificationPaymentInfo";
import { cancelPreviousAttachmentDownload } from "../../../store/actions/messages";
import { profileFiscalCodeSelector } from "../../../store/reducers/profile";
import { isCancelledFromPNMessagePot, paymentFromPNMessagePot } from "../utils";
import { trackPNUxSuccess } from "../analytics";
import { getRptIdFromPayment } from "../utils/rptId";
import { isStrictSome } from "../../../utils/pot";

export type PnMessageDetailsScreenNavigationParams = Readonly<{
  messageId: UIMessageId;
  serviceId: ServiceId;
  firstTimeOpening: boolean;
}>;

const renderMessage = (
  messageId: UIMessageId,
  messagePot: pot.Pot<O.Option<PNMessage>, Error>,
  service: ServicePublic | undefined,
  payment: NotificationPaymentInfo | undefined,
  rptId: RptId | undefined,
  onRetry: () => void
) =>
  pot.fold(
    messagePot,
    () => <></>,
    () => <MessageLoading />,
    () => <MessageLoading />,
    () => <PnMessageDetailsError onRetry={onRetry} />,
    messageOption =>
      O.isSome(messageOption) ? (
        <LegacyPnMessageDetails
          messageId={messageId}
          message={messageOption.value}
          service={service}
          payment={payment}
          rptId={rptId}
        />
      ) : (
        // decoding error
        <PnMessageDetailsError onRetry={onRetry} />
      ),
    () => <MessageLoading />,
    () => <></>,
    () => <></>
  );

export const LegacyPnMessageDetailsScreen = (
  props: IOStackNavigationRouteProps<PnParamsList, "PN_ROUTES_MESSAGE_DETAILS">
): React.ReactElement => {
  const { messageId, serviceId, firstTimeOpening } = props.route.params;

  const dispatch = useIODispatch();
  const navigation = useNavigation();
  const uxEventTracked = React.useRef(false);

  const service = pot.toUndefined(
    useIOSelector(state => serviceByIdSelector(serviceId)(state)) ?? pot.none
  );

  const currentFiscalCode = useIOSelector(profileFiscalCodeSelector);
  const message = useIOSelector(state =>
    pnMessageFromIdSelector(state, messageId)
  );
  const payment = paymentFromPNMessagePot(currentFiscalCode, message);
  const rptId = getRptIdFromPayment(payment);

  const loadContent = React.useCallback(() => {
    dispatch(loadThirdPartyMessage.request(messageId));
  }, [dispatch, messageId]);

  const customGoBack = React.useCallback(() => {
    dispatch(cancelPreviousAttachmentDownload());
    navigation.goBack();
  }, [dispatch, navigation]);

  useOnFirstRender(() => {
    loadContent();
  });

  if (!uxEventTracked.current && isStrictSome(message)) {
    // eslint-disable-next-line functional/immutable-data
    uxEventTracked.current = true;
    const isCancelled = isCancelledFromPNMessagePot(message);
    trackPNUxSuccess(!!rptId, firstTimeOpening, isCancelled);
  }

  return (
    <BaseScreenComponent
      goBack={customGoBack}
      headerTitle={I18n.t("features.pn.details.title")}
      contextualHelp={emptyContextualHelp}
    >
      <SafeAreaView style={IOStyles.flex}>
        {renderMessage(
          messageId,
          message,
          service,
          payment,
          rptId,
          loadContent
        )}
      </SafeAreaView>
    </BaseScreenComponent>
  );
};
