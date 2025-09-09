import { createStore } from "redux";
import { ServiceId } from "../../../../../../definitions/backend/ServiceId";
import { ThirdPartyAttachment } from "../../../../../../definitions/backend/ThirdPartyAttachment";
import { ThirdPartyMessage } from "../../../../../../definitions/backend/ThirdPartyMessage";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { loadThirdPartyMessage } from "../../../store/actions";
import {
  thirdPartyKinds,
  ThirdPartyMessageUnion
} from "../../../store/reducers/thirdPartyById";
import { ATTACHMENT_CATEGORY } from "../../../types/attachmentCategory";
import { MessageDetailsAttachments } from "../MessageDetailsAttachments";

const thirdPartyKindsMock = Object.values(thirdPartyKinds);

describe("MessageDetailsAttachments", () => {
  const messageId = "01HNWYRT55GXGPXR16BW2MSBVY";
  const serviceId = "01JKAGWVQRFE1P8QAHZS743M90" as ServiceId;
  thirdPartyKindsMock.forEach(kind => {
    it(`Should match snapshot with no attachments and kind='${kind}'`, () => {
      const component = renderScreen(
        messageId,
        serviceId,
        undefined,
        undefined,
        undefined,
        kind
      );
      expect(component.toJSON()).toMatchSnapshot();
    });
    it(`Should match snapshot with no attachments and disabled UI and kind='${kind}'`, () => {
      const component = renderScreen(
        messageId,
        serviceId,
        0,
        true,
        undefined,
        kind
      );
      expect(component.toJSON()).toMatchSnapshot();
    });
    it(`Should match snapshot with no attachments, where F24 have been removed and disabled UI and kind='${kind}'`, () => {
      const component = renderScreen(messageId, serviceId, 0, true, true, kind);
      expect(component.toJSON()).toMatchSnapshot();
    });
    it(`Should match snapshot with 1 attachment and kind='${kind}'`, () => {
      const component = renderScreen(
        messageId,
        serviceId,
        1,
        undefined,
        undefined,
        kind
      );
      expect(component.toJSON()).toMatchSnapshot();
    });
    it(`Should match snapshot with 1 attachment that is disabled and kind='${kind}'`, () => {
      const component = renderScreen(
        messageId,
        serviceId,
        1,
        true,
        undefined,
        kind
      );
      expect(component.toJSON()).toMatchSnapshot();
    });
    it(`Should match snapshot with 1 attachment that is disabled and F24 have been removed and kind='${kind}'`, () => {
      const component = renderScreen(messageId, serviceId, 1, true, true, kind);
      expect(component.toJSON()).toMatchSnapshot();
    });
    it(`Should match snapshot with 10 attachments and kind='${kind}'`, () => {
      const component = renderScreen(
        messageId,
        serviceId,
        10,
        undefined,
        undefined,
        kind
      );
      expect(component.toJSON()).toMatchSnapshot();
    });
    it(`Should match snapshot with 10 attachments that are disabled and kind='${kind}'`, () => {
      const component = renderScreen(
        messageId,
        serviceId,
        10,
        true,
        undefined,
        kind
      );
      expect(component.toJSON()).toMatchSnapshot();
    });
    it(`Should match snapshot with 5 attachments that are disabled and F24 have been removed and kind='${kind}'`, () => {
      const component = renderScreen(
        messageId,
        serviceId,
        10,
        true,
        true,
        kind
      );
      expect(component.toJSON()).toMatchSnapshot();
    });
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
