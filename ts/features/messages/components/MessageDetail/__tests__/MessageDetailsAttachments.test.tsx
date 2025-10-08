import { createStore } from "redux";
import { ServiceId } from "../../../../../../definitions/backend/ServiceId";
import { ThirdPartyAttachment } from "../../../../../../definitions/backend/ThirdPartyAttachment";
import { ThirdPartyMessage } from "../../../../../../definitions/backend/ThirdPartyMessage";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { loadThirdPartyMessage } from "../../../store/actions";
import { ATTACHMENT_CATEGORY } from "../../../types/attachmentCategory";
import { ThirdPartyMessageUnion } from "../../../types/thirdPartyById";
import { MessageDetailsAttachments } from "../MessageDetailsAttachments";

describe("MessageDetailsAttachments", () => {
  const messageId = "01HNWYRT55GXGPXR16BW2MSBVY";
  const serviceId = "01JKAGWVQRFE1P8QAHZS743M90" as ServiceId;
  it("Should match snapshot with no attachments", () => {
    const component = renderScreen(messageId, serviceId);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("Should match snapshot with no attachments and disabled UI", () => {
    const component = renderScreen(messageId, serviceId, 0, true);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("Should match snapshot with no attachments, where F24 have been removed and disabled UI", () => {
    const component = renderScreen(messageId, serviceId, 0, true, true);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("Should match snapshot with 1 attachment", () => {
    const component = renderScreen(messageId, serviceId, 1);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("Should match snapshot with 1 attachment that is disabled", () => {
    const component = renderScreen(messageId, serviceId, 1, true);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("Should match snapshot with 1 attachment that is disabled and F24 have been removed", () => {
    const component = renderScreen(messageId, serviceId, 1, true, true);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("Should match snapshot with 10 attachments", () => {
    const component = renderScreen(messageId, serviceId, 10);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("Should match snapshot with 10 attachments that are disabled", () => {
    const component = renderScreen(messageId, serviceId, 10, true);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("Should match snapshot with 5 attachments that are disabled and F24 have been removed", () => {
    const component = renderScreen(messageId, serviceId, 10, true, true);
    expect(component.toJSON()).toMatchSnapshot();
  });
});

const renderScreen = (
  messageId: string,
  serviceId: ServiceId,
  attachmentCount: number = 0,
  disabled: boolean = false,
  isPN: boolean = false,
  kind: ThirdPartyMessageUnion["kind"] = "TPM"
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
        kind,
        third_party_message: {
          attachments
        } as ThirdPartyMessage
      } as ThirdPartyMessageUnion
    })
  );
  const store = createStore(appReducer, finalState as any);

  return renderScreenWithNavigationStoreContext(
    () => (
      <MessageDetailsAttachments
        messageId={messageId}
        disabled={disabled}
        isPN={isPN}
        serviceId={serviceId}
      />
    ),
    "DUMMY",
    {},
    store
  );
};
