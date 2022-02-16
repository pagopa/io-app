import * as React from "react";
import { assistanceToolRemoteConfig } from "../utils/supportAssistance";
import { assistanceToolConfigSelector } from "../store/reducers/backendStatus";
import { useIOSelector } from "../store/hooks";
import { ToolEnum } from "../../definitions/content/AssistanceToolConfig";
import ZendeskChatComponent from "../features/zendesk/components/ZendeskChatComponent";
import InstabugChatsComponent from "./InstabugChatsComponent";

/**
 * This component render the right Chat tool based on the selected assistance tool
 * @constructor
 */
const ChatsComponent = () => {
  const assistanceToolConfig = useIOSelector(assistanceToolConfigSelector);
  const chosenTool = assistanceToolRemoteConfig(assistanceToolConfig);

  switch (chosenTool) {
    case ToolEnum.instabug:
      return <InstabugChatsComponent />;
    case ToolEnum.zendesk:
      return <ZendeskChatComponent />;
    case ToolEnum.none:
    case ToolEnum.web:
      return null;
  }
};

export default ChatsComponent;
