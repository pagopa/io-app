import { createStore } from "redux";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { UIAttachmentId, UIMessageId } from "../../types";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { MESSAGES_ROUTES } from "../../navigation/routes";
import { appReducer } from "../../../../store/reducers";
import { applicationChangeState } from "../../../../store/actions/application";
import { DSMessageAttachment } from "../DSMessageAttachment";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";

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
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const enrichedState = {
    ...globalState,
    persistedPreferences: {
      ...globalState.persistedPreferences,
      isDesignSystemEnabled: true
    },
    entities: {
      ...globalState.entities,
      messages: {
        ...globalState.entities.messages,
        downloads: {
          ...globalState.entities.messages.downloads,
          messageId:
            configuration === "success"
              ? {
                  attachmentId: pot.some({
                    attachment: {
                      messageId,
                      id: attachmentId,
                      cagegory: "default"
                    },
                    path: "file:///fileName.pdf"
                  })
                }
              : undefined
        }
      }
    }
  };
  const store = createStore(appReducer, enrichedState as any);

  return renderScreenWithNavigationStoreContext(
    DSMessageAttachment,
    MESSAGES_ROUTES.MESSAGE_DETAIL_ATTACHMENT,
    { messageId, attachmentId, isPN: false, serviceId },
    store
  );
};
