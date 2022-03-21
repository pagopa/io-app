import { View } from "react-native";
import * as React from "react";
import { useDispatch } from "react-redux";
import * as pot from "italia-ts-commons/lib/pot";
import { useIOSelector } from "../../../store/hooks";
import {
  zendeskTicketNumberSelector,
  zendeskTotalNewResponseSelector
} from "../store/reducers";
import { getValueOrElse } from "../../bonus/bpd/model/RemoteValue";
import ButtonDefaultOpacity from "../../../components/ButtonDefaultOpacity";
import { mixpanelTrack } from "../../../mixpanel";
import { showSupportTickets } from "../../../utils/supportAssistance";
import I18n from "../../../i18n";
import IconFont from "../../../components/ui/IconFont";
import CustomBadge from "../../../components/ui/CustomBadge";
import { zendeskSupportOpened } from "../store/actions";

/**
 * This component shows the chat component and the badge with the Zendesk unread messages counter.
 * This component is shown if the user has at least a message.
 * @constructor
 */
const ZendeskChatComponent = () => {
  const dispatch = useDispatch();
  const ticketsNumber = useIOSelector(zendeskTicketNumberSelector);
  const maybeTotalNewResponse = useIOSelector(zendeskTotalNewResponseSelector);

  const totalNewResponse = getValueOrElse(maybeTotalNewResponse, 0);

  if (pot.getOrElse(ticketsNumber, 0) <= 0) {
    return null;
  }
  return (
    <ButtonDefaultOpacity
      onPress={() => {
        void mixpanelTrack("ZENDESK_SHOW_TICKETS_FROM_CHAT");
        dispatch(zendeskSupportOpened());
        showSupportTickets();
      }}
      transparent={true}
      accessibilityLabel={I18n.t("global.accessibility.chat.description")}
      accessibilityHint={"accessibilityHint"}
      testID={"ZendeskChatComponent"}
    >
      <IconFont name="io-chat" />
      {totalNewResponse > 0 && (
        <View style={{ position: "absolute", left: 6, bottom: 10 }}>
          <CustomBadge badgeValue={totalNewResponse} />
        </View>
      )}
    </ButtonDefaultOpacity>
  );
};

export default ZendeskChatComponent;
