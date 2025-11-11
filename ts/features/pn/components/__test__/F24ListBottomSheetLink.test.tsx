import { createStore } from "redux";
import { fireEvent } from "@testing-library/react-native";
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
import * as ANALYTICS from "../../analytics";
import * as IO_BOTTOM_SHEET from "../../../../utils/hooks/bottomSheet";

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
  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });
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
  sendOpeningSources.forEach(sendOpeningSource =>
    sendUserTypes.forEach(sendUserType => {
      it(`should call trackPNShowF24 with proper parameters (opening source ${sendOpeningSource}, user type ${sendUserType})`, () => {
        const spiedOnMockedTrackPNShowF24 = jest
          .spyOn(ANALYTICS, "trackPNShowF24")
          .mockImplementation();
        const refUseIOBottomSheetModal = IO_BOTTOM_SHEET.useIOBottomSheetModal;
        jest
          .spyOn(IO_BOTTOM_SHEET, "useIOBottomSheetModal")
          .mockImplementation(props => {
            const { bottomSheet } = refUseIOBottomSheetModal(props);
            return {
              bottomSheet,
              dismiss: jest.fn(),
              present: jest.fn()
            };
          });
        const component = renderComponent([], sendOpeningSource, sendUserType);

        const button = component.getByTestId(
          "f24_list_bottomsheet_link_button"
        );
        fireEvent.press(button);

        expect(spiedOnMockedTrackPNShowF24.mock.calls.length).toBe(1);
        expect(spiedOnMockedTrackPNShowF24.mock.calls[0].length).toBe(2);
        expect(spiedOnMockedTrackPNShowF24.mock.calls[0][0]).toBe(
          sendOpeningSource
        );
        expect(spiedOnMockedTrackPNShowF24.mock.calls[0][1]).toBe(sendUserType);
      });
    })
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
