import { createStore } from "redux";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { F24ListBottomSheetLink } from "../F24ListBottomSheetLink";
import { ThirdPartyAttachment } from "../../../../../definitions/backend/ThirdPartyAttachment";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import PN_ROUTES from "../../navigation/routes";
import {
  SendOpeningSource,
  SendUserType
} from "../../../pushNotifications/analytics";

const numberToThirdPartyAttachment = (index: number) =>
  ({
    id: `${index}`,
    url: `https://domain.url/doc${index}.pdf`
  } as ThirdPartyAttachment);

const f24Lists: ReadonlyArray<ReadonlyArray<ThirdPartyAttachment>> = [
  [],
  [{ ...numberToThirdPartyAttachment(1) }],
  [
    { ...numberToThirdPartyAttachment(1) },
    { ...numberToThirdPartyAttachment(2) }
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

describe("F24ListBottomSheetLink", () => {
  f24Lists.forEach(f24List =>
    sendOpeningSources.forEach(sendOpeningSource =>
      sendUserTypes.forEach(sendUserType => {
        it(`should match snapshot (${f24List.length} items, opening source ${sendOpeningSource}, user type ${sendUserType})`, () => {
          const component = renderComponent(
            f24List,
            sendOpeningSource,
            sendUserType
          );
          expect(component.toJSON()).toMatchSnapshot();
        });
      })
    )
  );
});

const renderComponent = (
  f24List: ReadonlyArray<ThirdPartyAttachment>,
  openingSource: SendOpeningSource,
  userType: SendUserType
) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);

  return renderScreenWithNavigationStoreContext(
    () => (
      <F24ListBottomSheetLink
        f24List={f24List}
        messageId={"01HS94671EXDWDESDJB3NCBYPM"}
        serviceId={"01JKAGWVQRFE1P8QAHZS743M90" as ServiceId}
        sendOpeningSource={openingSource}
        sendUserType={userType}
      />
    ),
    PN_ROUTES.MESSAGE_DETAILS,
    {},
    store
  );
};
