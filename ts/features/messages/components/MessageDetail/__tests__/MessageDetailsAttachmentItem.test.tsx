import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import { preferencesDesignSystemSetEnabled } from "../../../../../store/actions/persistedPreferences";
import { appReducer } from "../../../../../store/reducers";
import { downloadAttachment } from "../../../store/actions";
import { UIMessageId } from "../../../types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { MessageDetailsAttachmentItem } from "../MessageDetailsAttachmentItem";
import { ThirdPartyAttachment } from "../../../../../../definitions/backend/ThirdPartyAttachment";
import { ServiceId } from "../../../../../../definitions/backend/ServiceId";

describe("MessageDetailsAttachmentItem", () => {
  it("Should match snapshot with required parameters", () => {
    const messageId = "01HNWXJG52YS359GWSYSRK2BWC" as UIMessageId;
    const thirdPartyAttachment = {
      id: "1",
      url: "https://invalid.url",
      content_type: "application/pdf",
      name: "A PDF File",
      category: "DOCUMENT"
    } as ThirdPartyAttachment;

    const component = renderScreen(thirdPartyAttachment, messageId);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("Should match snapshot with all parameters", () => {
    const messageId = "01HNWXJG52YS359GWSYSRK2BWC" as UIMessageId;
    const thirdPartyAttachment = {
      id: "1",
      url: "https://invalid.url",
      content_type: "application/pdf",
      name: "A PDF File",
      category: "DOCUMENT"
    } as ThirdPartyAttachment;
    const serviceId = "01HNWXKWAGWPHV7VGMQ21EZPSA" as ServiceId;

    const component = renderScreen(
      thirdPartyAttachment,
      messageId,
      serviceId,
      true,
      false,
      true
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("Should match snapshot when the attachment has no name", () => {
    const messageId = "01HNWXJG52YS359GWSYSRK2BWC" as UIMessageId;
    const thirdPartyAttachment = {
      id: "1",
      url: "https://invalid.url",
      content_type: "application/pdf",
      category: "DOCUMENT"
    } as ThirdPartyAttachment;

    const component = renderScreen(thirdPartyAttachment, messageId);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("Should match snapshot when is fetching the attachment", () => {
    const messageId = "01HNWXJG52YS359GWSYSRK2BWC" as UIMessageId;
    const thirdPartyAttachment = {
      id: "1",
      url: "https://invalid.url",
      content_type: "application/pdf",
      category: "DOCUMENT"
    } as ThirdPartyAttachment;

    const component = renderScreen(
      thirdPartyAttachment,
      messageId,
      undefined,
      undefined,
      true,
      false
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
});

const renderScreen = (
  attachment: ThirdPartyAttachment,
  messageId: UIMessageId,
  serviceId?: ServiceId,
  bottomSpacer?: boolean,
  isFetching?: boolean,
  disabled?: boolean
) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const designSystemState = appReducer(
    initialState,
    preferencesDesignSystemSetEnabled({ isDesignSystemEnabled: true })
  );
  const finalState = appReducer(
    designSystemState,
    isFetching
      ? downloadAttachment.request({
          attachment,
          messageId,
          skipMixpanelTrackingOnFailure: false
        })
      : downloadAttachment.success({
          messageId,
          attachment,
          path: "file:///fileName.pdf"
        })
  );
  const store = createStore(appReducer, finalState as any);

  return renderScreenWithNavigationStoreContext(
    () => (
      <MessageDetailsAttachmentItem
        attachment={attachment}
        bottomSpacer={bottomSpacer}
        disabled={disabled}
        messageId={messageId}
        serviceId={serviceId}
      />
    ),
    "DUMMY",
    {},
    store
  );
};
