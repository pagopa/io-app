import { createStore } from "redux";
import { F24Section } from "../F24Section";
import { appReducer } from "../../../../store/reducers";
import { applicationChangeState } from "../../../../store/actions/application";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import * as thirdPartyById from "../../../messages/store/reducers/thirdPartyById";
import { ThirdPartyAttachment } from "../../../../../definitions/backend/ThirdPartyAttachment";
import { ATTACHMENT_CATEGORY } from "../../../messages/types/attachmentCategory";
import PN_ROUTES from "../../navigation/routes";
import {
  SendOpeningSource,
  SendUserType
} from "../../../pushNotifications/analytics";

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
              .spyOn(thirdPartyById, "thirdPartyMessageAttachments")
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
        messageId={"01HS1ANR1SDPN3BP51X3G74T64"}
        serviceId={"01HS1ANWT4N83QGATCXYMXDP8M" as ServiceId}
        isCancelled={isCancelled}
        sendOpeningSource={openingSource}
        sendUserType={userType}
      />
    ),
    PN_ROUTES.MESSAGE_DETAILS,
    {},
    store
  );
};
