import { createStore } from "redux";
import { F24Section } from "../F24Section";
import { appReducer } from "../../../../store/reducers";
import { applicationChangeState } from "../../../../store/actions/application";
import { UIMessageId } from "../../../messages/types";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import * as thirdPartyById from "../../../messages/store/reducers/thirdPartyById";
import { ThirdPartyAttachment } from "../../../../../definitions/backend/ThirdPartyAttachment";
import { ATTACHMENT_CATEGORY } from "../../../messages/types/attachmentCategory";
import { mockAccessibilityInfo } from "../../../../utils/testAccessibility";

const generateOneAttachmentArray = () => [
  {
    id: "1",
    url: "https://no.url/doc.pdf"
  } as ThirdPartyAttachment
];
const generateThreeAttachmentArray = () => [
  {
    id: "1",
    url: "https://no.url/doc.pdf"
  } as ThirdPartyAttachment,
  {
    id: "2",
    url: "https://no.url/docF24.pdf",
    category: ATTACHMENT_CATEGORY.F24
  } as ThirdPartyAttachment,
  {
    id: "3",
    url: "https://no.url/cod.pdf"
  } as ThirdPartyAttachment
];
const generateFourAttachmentArray = () => [
  {
    id: "1",
    url: "https://no.url/doc.pdf"
  } as ThirdPartyAttachment,
  {
    id: "2",
    url: "https://no.url/docF24.pdf",
    category: ATTACHMENT_CATEGORY.F24
  } as ThirdPartyAttachment,
  {
    id: "3",
    url: "https://no.url/cod.pdf"
  } as ThirdPartyAttachment,
  {
    id: "4",
    url: "https://no.url/f24Doc.pdf",
    category: ATTACHMENT_CATEGORY.F24
  } as ThirdPartyAttachment
];

describe("F24Section", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
    mockAccessibilityInfo(false);
  });
  it("should match snapshot when there are no F24", () => {
    jest
      .spyOn(thirdPartyById, "thirdPartyMessageAttachments")
      .mockImplementation((_state, _messageId) => generateOneAttachmentArray());
    const component = renderComponent();
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot when there are no F24 and the message is cancelled", () => {
    jest
      .spyOn(thirdPartyById, "thirdPartyMessageAttachments")
      .mockImplementation((_state, _messageId) => generateOneAttachmentArray());
    const component = renderComponent(true);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot when there is a single F24", () => {
    jest
      .spyOn(thirdPartyById, "thirdPartyMessageAttachments")
      .mockImplementation((_state, _messageId) =>
        generateThreeAttachmentArray()
      );
    const component = renderComponent();
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot when there is a single F24 and the message is cancelled", () => {
    jest
      .spyOn(thirdPartyById, "thirdPartyMessageAttachments")
      .mockImplementation((_state, _messageId) =>
        generateThreeAttachmentArray()
      );
    const component = renderComponent(true);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot when there are more than one F24", () => {
    jest
      .spyOn(thirdPartyById, "thirdPartyMessageAttachments")
      .mockImplementation((_state, _messageId) =>
        generateFourAttachmentArray()
      );
    const component = renderComponent();
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot when there are more than one F24 and the message is cancelled", () => {
    jest
      .spyOn(thirdPartyById, "thirdPartyMessageAttachments")
      .mockImplementation((_state, _messageId) =>
        generateFourAttachmentArray()
      );
    const component = renderComponent(true);
    expect(component.toJSON()).toMatchSnapshot();
  });
});

const renderComponent = (isCancelled: boolean = false) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);

  return renderScreenWithNavigationStoreContext(
    () => (
      <F24Section
        messageId={"01HS1ANR1SDPN3BP51X3G74T64" as UIMessageId}
        serviceId={"01HS1ANWT4N83QGATCXYMXDP8M" as ServiceId}
        isCancelled={isCancelled}
      />
    ),
    "DUMMY",
    {},
    store
  );
};
