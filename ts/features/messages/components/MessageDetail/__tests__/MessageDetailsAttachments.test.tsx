import { ReactNode } from "react";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { View } from "react-native";
import { createStore } from "redux";
import { ServiceId } from "../../../../../../definitions/backend/ServiceId";
import { ThirdPartyAttachment } from "../../../../../../definitions/backend/ThirdPartyAttachment";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { MessageDetailsAttachments } from "../MessageDetailsAttachments";
import { MESSAGES_ROUTES } from "../../../navigation/routes";
import * as thirdPartySelectors from "../../../store/reducers/thirdPartyById";
import {
  SendOpeningSource,
  SendUserType
} from "../../../../pushNotifications/analytics";

jest.mock("../MessageDetailsAttachmentItem");

describe("MessageDetailsAttachments", () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  const messageId = "01HNWYRT55GXGPXR16BW2MSBVY";
  const serviceId = "01JKAGWVQRFE1P8QAHZS743M90" as ServiceId;
  const attachments: ReadonlyArray<ReadonlyArray<ThirdPartyAttachment>> = [
    [],
    [
      {
        id: "1" as NonEmptyString,
        url: "https://an.url/path" as NonEmptyString
      }
    ],
    [
      {
        id: "1" as NonEmptyString,
        url: "https://an.url/path" as NonEmptyString
      },
      {
        category: "DOCUMENT",
        content_type: "application/pdf" as NonEmptyString,
        id: "2" as NonEmptyString,
        name: "Document.pdf" as NonEmptyString,
        url: "https://an.url/document" as NonEmptyString
      },
      {
        category: "F24",
        content_type: "application/pdf" as NonEmptyString,
        id: "3" as NonEmptyString,
        name: "f24.pdf" as NonEmptyString,
        url: "https://an.url/f24" as NonEmptyString
      },
      {
        category: "PAGOPA",
        content_type: "application/pdf" as NonEmptyString,
        id: "4" as NonEmptyString,
        name: "pagopa.pdf" as NonEmptyString,
        url: "https://an.url/pagopa" as NonEmptyString
      }
    ]
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

  const reactComponent = <View>{"A banner"}</View>;
  attachments.forEach(attachmentArray =>
    [undefined, reactComponent].forEach(banner =>
      [undefined, false, true].forEach(disabled =>
        sendOpeningSources.forEach(sendOpeningSource =>
          sendUserTypes.forEach(sendUserType =>
            it(`should match snapshot (${
              attachmentArray.length
            } attachments) (has ${
              banner ? "" : "no "
            }banner) (disabled: ${disabled}) (opening source: ${sendOpeningSource} user type: ${sendUserType})`, () => {
              jest
                .spyOn(thirdPartySelectors, "thirdPartyMessageAttachments")
                .mockImplementation((_state, _messageId) => attachmentArray);
              const component = renderScreen(
                messageId,
                serviceId,
                disabled,
                sendOpeningSource,
                sendUserType,
                banner
              );
              expect(component.toJSON()).toMatchSnapshot();
            })
          )
        )
      )
    )
  );
});

const renderScreen = (
  messageId: string,
  serviceId: ServiceId,
  disabled: boolean | undefined,
  sendOpeningSource: SendOpeningSource,
  sendUserType: SendUserType,
  banner: ReactNode | undefined
) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));

  const finalState = appReducer(initialState, applicationChangeState("active"));
  const store = createStore(appReducer, finalState as any);

  return renderScreenWithNavigationStoreContext(
    () => (
      <MessageDetailsAttachments
        banner={banner}
        messageId={messageId}
        disabled={disabled}
        sendOpeningSource={sendOpeningSource}
        sendUserType={sendUserType}
        serviceId={serviceId}
      />
    ),
    MESSAGES_ROUTES.MESSAGE_DETAIL,
    {},
    store
  );
};
