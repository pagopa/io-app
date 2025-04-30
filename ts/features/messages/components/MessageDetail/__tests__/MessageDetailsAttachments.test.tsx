import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { UIMessageId } from "../../../types";
import { MessageDetailsAttachments } from "../MessageDetailsAttachments";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { loadThirdPartyMessage } from "../../../store/actions";
import { ThirdPartyMessage } from "../../../../../../definitions/communications/ThirdPartyMessage";
import { ThirdPartyMessageWithContent } from "../../../../../../definitions/communications/ThirdPartyMessageWithContent";
import { ThirdPartyAttachment } from "../../../../../../definitions/communications/ThirdPartyAttachment";
import { ATTACHMENT_CATEGORY } from "../../../types/attachmentCategory";

describe("MessageDetailsAttachments", () => {
  it("Should match snapshot with no attachments", () => {
    const messageId = "01HNWYRT55GXGPXR16BW2MSBVY" as UIMessageId;
    const component = renderScreen(messageId);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("Should match snapshot with no attachments and disabled UI", () => {
    const messageId = "01HNWYRT55GXGPXR16BW2MSBVY" as UIMessageId;
    const component = renderScreen(messageId, 0, true);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("Should match snapshot with no attachments, where F24 have been removed and disabled UI", () => {
    const messageId = "01HNWYRT55GXGPXR16BW2MSBVY" as UIMessageId;
    const component = renderScreen(messageId, 0, true, true);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("Should match snapshot with 1 attachment", () => {
    const messageId = "01HNWYRT55GXGPXR16BW2MSBVY" as UIMessageId;
    const component = renderScreen(messageId, 1);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("Should match snapshot with 1 attachment that is disabled", () => {
    const messageId = "01HNWYRT55GXGPXR16BW2MSBVY" as UIMessageId;
    const component = renderScreen(messageId, 1, true);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("Should match snapshot with 1 attachment that is disabled and F24 have been removed", () => {
    const messageId = "01HNWYRT55GXGPXR16BW2MSBVY" as UIMessageId;
    const component = renderScreen(messageId, 1, true, true);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("Should match snapshot with 10 attachments", () => {
    const messageId = "01HNWYRT55GXGPXR16BW2MSBVY" as UIMessageId;
    const component = renderScreen(messageId, 10);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("Should match snapshot with 10 attachments that are disabled", () => {
    const messageId = "01HNWYRT55GXGPXR16BW2MSBVY" as UIMessageId;
    const component = renderScreen(messageId, 10, true);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("Should match snapshot with 5 attachments that are disabled and F24 have been removed", () => {
    const messageId = "01HNWYRT55GXGPXR16BW2MSBVY" as UIMessageId;
    const component = renderScreen(messageId, 10, true, true);
    expect(component.toJSON()).toMatchSnapshot();
  });
});

const renderScreen = (
  messageId: UIMessageId,
  attachmentCount: number = 0,
  disabled: boolean = false,
  isPN: boolean = false
) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));

  const attachments = Array(attachmentCount).map(index => ({
    id: `${index}`,
    url: `https://invalid.url/${index}.pdf`,
    category: index % 2 === 1 ? ATTACHMENT_CATEGORY.F24 : undefined
  })) as Array<ThirdPartyAttachment>;

  const finalState = appReducer(
    initialState,
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
    () => (
      <MessageDetailsAttachments
        messageId={messageId}
        disabled={disabled}
        isPN={isPN}
      />
    ),
    "DUMMY",
    {},
    store
  );
};
