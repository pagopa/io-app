import { createStore } from "redux";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { MESSAGES_ROUTES } from "../../navigation/routes";
import { appReducer } from "../../../../store/reducers";
import { applicationChangeState } from "../../../../store/actions/application";
import { MessageAttachmentScreen } from "../MessageAttachmentScreen";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { downloadAttachment } from "../../store/actions";
import { ThirdPartyAttachment } from "../../../../../definitions/backend/ThirdPartyAttachment";

describe("MessageAttachment", () => {
  it("Should match the snapshot when there is an error", () => {
    const messageId = "01HMZWRG7549N76017YR8YBSG2";
    const attachmentId = "1";
    const serviceId = "01HMZXFS84T1Q1BN6GXRYT63VJ" as ServiceId;
    const screen = renderScreen(messageId, attachmentId, serviceId, "failure");
    expect(screen.toJSON()).toMatchSnapshot();
  });
  it("Should match the snapshot when everything went fine", () => {
    const messageId = "01HMZWRG7549N76017YR8YBSG2";
    const attachmentId = "1";
    const serviceId = "01HMZXFS84T1Q1BN6GXRYT63VJ" as ServiceId;
    const screen = renderScreen(messageId, attachmentId, serviceId, "success");
    expect(screen.toJSON()).toMatchSnapshot();
  });
});

const renderScreen = (
  messageId: string,
  attachmentId: string,
  serviceId: ServiceId,
  configuration: "failure" | "success"
) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const withDownloadState = appReducer(
    initialState,
    downloadAttachment.success({
      attachment: { id: attachmentId } as ThirdPartyAttachment,
      messageId,
      path: "file:///fileName.pdf"
    })
  );
  const store = createStore(
    appReducer,
    (configuration === "success" ? withDownloadState : initialState) as any
  );

  return renderScreenWithNavigationStoreContext(
    MessageAttachmentScreen,
    MESSAGES_ROUTES.MESSAGE_DETAIL_ATTACHMENT,
    { messageId, attachmentId, isPN: false, serviceId },
    store
  );
};
