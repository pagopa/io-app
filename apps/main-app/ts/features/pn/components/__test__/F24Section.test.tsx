import { createStore } from "redux";

import { ThirdPartyAttachment } from "../../../../../definitions/communication/ThirdPartyAttachment";
import { ServiceId } from "../../../../../definitions/services/ServiceId";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import * as thirdPartyById from "../../../messages/store/reducers/thirdPartyById";
import { ATTACHMENT_CATEGORY } from "../../../messages/types/attachmentCategory";
import {
  SendOpeningSource,
  SendUserType
} from "../../../pushNotifications/analytics";
import PN_ROUTES from "../../navigation/routes";
import { F24Section } from "../F24Section";

jest.mock(
  "../../../messages/components/MessageDetail/MessageDetailsAttachmentItem"
);
jest.mock("../F24ListBottomSheetLink");

const thirdPartyAttachmentLists: ReadonlyArray<
  ReadonlyArray<ThirdPartyAttachment>
> = [
  [],
  [
    {
      id: "1",
      url: "https://no.url/doc.pdf"
    } as ThirdPartyAttachment
  ],
  [
    {
      id: "1",
      url: "https://no.url/docF24.pdf",
      category: ATTACHMENT_CATEGORY.F24
    } as ThirdPartyAttachment
  ],
  [
    {
      id: "1",
      url: "https://no.url/doc.pdf"
    } as ThirdPartyAttachment,
    {
      id: "2",
      url: "https://no.url/docF24.pdf",
      category: ATTACHMENT_CATEGORY.F24
    } as ThirdPartyAttachment
  ],
  [
    {
      id: "1",
      url: "https://no.url/docF24_1.pdf",
      category: ATTACHMENT_CATEGORY.F24
    } as ThirdPartyAttachment,
    {
      id: "2",
      url: "https://no.url/docF24_2.pdf",
      category: ATTACHMENT_CATEGORY.F24
    } as ThirdPartyAttachment
  ],
  [
    {
      id: "1",
      url: "https://no.url/docF24_1.pdf",
      category: ATTACHMENT_CATEGORY.F24
    } as ThirdPartyAttachment,
    {
      id: "2",
      url: "https://no.url/doc.pdf"
    } as ThirdPartyAttachment,
    {
      id: "3",
      url: "https://no.url/docF24_3.pdf",
      category: ATTACHMENT_CATEGORY.F24
    } as ThirdPartyAttachment
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

// Vuoto, un documento, un f24, un f24+doc, due f24, duef24+doc

describe("F24Section", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });
  thirdPartyAttachmentLists.forEach(thirdPartyAttachmentList =>
    [undefined, false, true].forEach(isCancelled =>
      sendOpeningSources.forEach(sendOpeningSource =>
        sendUserTypes.forEach(sendUserType => {
          it(`should match snapshot (list: [${thirdPartyAttachmentList
            .map(
              thirdPartyAttachment =>
                thirdPartyAttachment.category ?? "undefined"
            )
            .join(
              " "
            )}], cancelled ${isCancelled}, opening source ${sendOpeningSource}, user type ${sendUserType})`, () => {
            jest
              .spyOn(thirdPartyById, "thirdPartyMessageAttachmentsSelector")
              .mockImplementation(
                (_state, _messageId) => thirdPartyAttachmentList
              );
            const component = renderComponent(
              isCancelled,
              sendOpeningSource,
              sendUserType
            );
            expect(component.toJSON()).toMatchSnapshot();
          });
        })
      )
    )
  );
});

const renderComponent = (
  isCancelled: boolean | undefined,
  openingSource: SendOpeningSource,
  userType: SendUserType
) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);

  return renderScreenWithNavigationStoreContext(
    () => (
      <F24Section
        isCancelled={isCancelled}
        messageId={"01HS1ANR1SDPN3BP51X3G74T64"}
        sendOpeningSource={openingSource}
        sendUserType={userType}
        serviceId={"01HS1ANWT4N83QGATCXYMXDP8M" as ServiceId}
      />
    ),
    PN_ROUTES.MESSAGE_DETAILS,
    {},
    store
  );
};
