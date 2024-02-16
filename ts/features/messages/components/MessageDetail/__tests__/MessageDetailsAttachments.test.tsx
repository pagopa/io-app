import * as React from "react";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import { preferencesDesignSystemSetEnabled } from "../../../../../store/actions/persistedPreferences";
import { appReducer } from "../../../../../store/reducers";
import { UIMessageId } from "../../../types";
import { MessageDetailsAttachments } from "../MessageDetailsAttachments";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { loadThirdPartyMessage } from "../../../store/actions";
import { ThirdPartyMessage } from "../../../../../../definitions/backend/ThirdPartyMessage";
import { ThirdPartyMessageWithContent } from "../../../../../../definitions/backend/ThirdPartyMessageWithContent";
import { ThirdPartyAttachment } from "../../../../../../definitions/backend/ThirdPartyAttachment";

describe("MessageDetailsAttachments", () => {
  it("Should match snapshot with no attachments", () => {
    const messageId = "01HNWYRT55GXGPXR16BW2MSBVY" as UIMessageId;
    const component = renderScreen(messageId);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("Should match snapshot with 1 attachment", () => {
    const messageId = "01HNWYRT55GXGPXR16BW2MSBVY" as UIMessageId;
    const component = renderScreen(messageId, 1);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("Should match snapshot with 10 attachments", () => {
    const messageId = "01HNWYRT55GXGPXR16BW2MSBVY" as UIMessageId;
    const component = renderScreen(messageId, 10);
    expect(component.toJSON()).toMatchSnapshot();
  });
});

const renderScreen = (messageId: UIMessageId, attachmentCount: number = 0) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const designSystemState = appReducer(
    initialState,
    preferencesDesignSystemSetEnabled({ isDesignSystemEnabled: true })
  );

  const attachments = Array(attachmentCount).map(index => ({
    id: `${index}`,
    url: `https://invalid.url/${index}.pdf`
  })) as Array<ThirdPartyAttachment>;

  const finalState = appReducer(
    designSystemState,
    loadThirdPartyMessage.success({
      id: messageId,
      content: {
        third_party_message: {
          attachments
        } as ThirdPartyMessage
      } as ThirdPartyMessageWithContent
    })
  );
  const store = createStore(appReducer, finalState as any);

  return renderScreenWithNavigationStoreContext(
    () => <MessageDetailsAttachments messageId={messageId} />,
    "DUMMY",
    {},
    store
  );
};
