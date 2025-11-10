import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { downloadAttachment } from "../../../store/actions";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { MessageDetailsAttachmentItem } from "../MessageDetailsAttachmentItem";
import { ThirdPartyAttachment } from "../../../../../../definitions/backend/ThirdPartyAttachment";
import { ServiceId } from "../../../../../../definitions/backend/ServiceId";
import { MESSAGES_ROUTES } from "../../../navigation/routes";
import {
  SendOpeningSource,
  SendUserType
} from "../../../../pushNotifications/analytics";

const messageId = "01HNWXJG52YS359GWSYSRK2BWC";
const serviceId = "01HNWXKWAGWPHV7VGMQ21EZPSA" as ServiceId;
const thirdPartyAttachments: ReadonlyArray<ThirdPartyAttachment> = [
  {
    id: "1",
    url: "https://invalid.url",
    content_type: "application/pdf",
    category: "DOCUMENT"
  } as ThirdPartyAttachment,
  {
    id: "1",
    url: "https://invalid.url",
    content_type: "application/pdf",
    name: "A PDF File",
    category: "DOCUMENT"
  } as ThirdPartyAttachment
];

const sendOpeningSources: ReadonlyArray<SendOpeningSource> = [
  "aar",
  "message",
  "not_set"
];
const sendUserTypes: ReadonlyArray<SendUserType> = [
  "mandatory",
  "not_set",
  "recipient"
];

thirdPartyAttachments.forEach(thirdPartyAttachment => {
  // eslint-disable-next-line sonarjs/cognitive-complexity
  [false, true].forEach(isFetching => {
    [undefined, false, true].forEach(showBottomSpacer => {
      [undefined, false, true].forEach(isDisabled => {
        sendOpeningSources.forEach(sendOpeningSource => {
          sendUserTypes.forEach(sendUserType => {
            it(`should match snapshot (attachment ${
              thirdPartyAttachment.name ? "with" : "without"
            } name, ${isFetching ? "" : "not "}fetching, ${
              showBottomSpacer ? "with" : "without"
            } bottom spacer, ${
              isDisabled ? "disabled" : "enabled"
            }, opening source ${sendOpeningSource}, user type ${sendUserType})`, () => {
              const component = renderScreen(
                thirdPartyAttachment,
                isFetching,
                showBottomSpacer,
                isDisabled,
                sendOpeningSource,
                sendUserType
              );
              expect(component.toJSON()).toMatchSnapshot();
            });
          });
        });
      });
    });
  });
});

const renderScreen = (
  attachment: ThirdPartyAttachment,
  isFetching: boolean,
  bottomSpacer: boolean | undefined,
  disabled: boolean | undefined,
  sendOpeningSource: SendOpeningSource,
  sendUserType: SendUserType
) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const finalState = appReducer(
    initialState,
    isFetching
      ? downloadAttachment.request({
          attachment,
          messageId,
          skipMixpanelTrackingOnFailure: false,
          serviceId
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
        sendOpeningSource={sendOpeningSource}
        sendUserType={sendUserType}
      />
    ),
    MESSAGES_ROUTES.MESSAGE_DETAIL,
    {},
    store
  );
};
