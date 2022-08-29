import * as React from "react";
import * as pot from "italia-ts-commons/lib/pot";
import { SafeAreaView } from "react-native";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";

import { IOStackNavigationRouteProps } from "../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { UIMessageId } from "../../../store/reducers/entities/messages/types";
import { emptyContextualHelp } from "../../../utils/emptyContextualHelp";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";
import { MessageLoading } from "../../messages/components/MessageLoading";
import { PnParamsList } from "../navigation/params";
import { PnMessageDetailsError } from "../components/PnMessageDetailsError";
import I18n from "../../../i18n";
import { loadThirdPartyMessage } from "../../messages/store/actions";
import { pnMessageFromIdSelector } from "../store/reducers";
import { PNMessage } from "../store/types/types";
import { PnMessageDetails } from "../components/PnMessageDetails";
import { serviceByIdSelector } from "../../../store/reducers/entities/services/servicesById";
import { ServicePublic } from "../../../../definitions/backend/ServicePublic";
import { ServiceId } from "../../../../definitions/backend/ServiceId";

export type PnMessageDetailsScreenNavigationParams = Readonly<{
  messageId: UIMessageId;
  serviceId: ServiceId;
}>;

const renderMessage = (
  messageId: UIMessageId,
  message: pot.Pot<PNMessage | undefined, Error>,
  service: ServicePublic | undefined,
  onRetry: () => void
) =>
  pot.fold(
    message,
    () => <></>,
    () => <MessageLoading />,
    () => <MessageLoading />,
    () => <PnMessageDetailsError onRetry={onRetry} />,
    message =>
      message ? (
        <PnMessageDetails
          messageId={messageId}
          message={message}
          service={service}
        />
      ) : (
        // decoding error
        <PnMessageDetailsError onRetry={onRetry} />
      ),
    () => <MessageLoading />,
    () => <></>,
    () => <></>
  );

export const PnMessageDetailsScreen = (
  props: IOStackNavigationRouteProps<PnParamsList, "PN_ROUTES_MESSAGE_DETAILS">
): React.ReactElement => {
  const messageId = props.route.params.messageId;
  const serviceId = props.route.params.serviceId;

  const dispatch = useIODispatch();

  const service = pot.toUndefined(
    useIOSelector(state => serviceByIdSelector(serviceId)(state)) ?? pot.none
  );

  const message = useIOSelector(state =>
    pnMessageFromIdSelector(state, messageId)
  );

  const loadContent = React.useCallback(() => {
    dispatch(loadThirdPartyMessage.request(messageId));
  }, [dispatch, messageId]);

  useOnFirstRender(() => {
    loadContent();
  });

  return (
    <BaseScreenComponent
      goBack={true}
      headerTitle={I18n.t("features.pn.details.title")}
      contextualHelp={emptyContextualHelp}>
      <SafeAreaView style={IOStyles.flex}>
        {renderMessage(messageId, message, service, loadContent)}
      </SafeAreaView>
    </BaseScreenComponent>
  );
};
