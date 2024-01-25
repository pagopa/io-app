import { createStore } from "redux";
import { UIAttachment, UIAttachmentId, UIMessageId } from "../../types";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { MESSAGES_ROUTES } from "../../navigation/routes";
import { appReducer } from "../../../../store/reducers";
import { applicationChangeState } from "../../../../store/actions/application";
import { DSMessageAttachment } from "../DSMessageAttachment";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { downloadAttachment } from "../../store/actions";
import { preferencesDesignSystemSetEnabled } from "../../../../store/actions/persistedPreferences";

describe("DSMessageAttachment", () => {
  it("Should match the snapshot when there is an error", () => {
    const messageId = "01HMZWRG7549N76017YR8YBSG2" as UIMessageId;
    const attachmentId = "1" as UIAttachmentId;
    const serviceId = "01HMZXFS84T1Q1BN6GXRYT63VJ" as ServiceId;
    const screen = renderScreen(messageId, attachmentId, serviceId, "failure");
    expect(screen.toJSON()).toMatchSnapshot();
  });
  it("Should match the snapshot when everything went fine", () => {
    const messageId = "01HMZWRG7549N76017YR8YBSG2" as UIMessageId;
    const attachmentId = "1" as UIAttachmentId;
    const serviceId = "01HMZXFS84T1Q1BN6GXRYT63VJ" as ServiceId;
    const screen = renderScreen(messageId, attachmentId, serviceId, "success");
    expect(screen.toJSON()).toMatchSnapshot();
  });
});

const renderScreen = (
  messageId: UIMessageId,
  attachmentId: UIAttachmentId,
  serviceId: ServiceId,
  configuration: "failure" | "success"
) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const designSystemState = appReducer(
    initialState,
    preferencesDesignSystemSetEnabled({ isDesignSystemEnabled: true })
  );
  const withDownloadState = appReducer(
    designSystemState,
    downloadAttachment.success({
      attachment: { id: attachmentId, messageId } as UIAttachment,
      path: "file:///fileName.pdf"
    })
  );
  const store = createStore(
    appReducer,
    (configuration === "success" ? withDownloadState : designSystemState) as any
  );

  return renderScreenWithNavigationStoreContext(
    DSMessageAttachment,
    MESSAGES_ROUTES.MESSAGE_DETAIL_ATTACHMENT,
    { messageId, attachmentId, isPN: false, serviceId },
    store
  );
};
