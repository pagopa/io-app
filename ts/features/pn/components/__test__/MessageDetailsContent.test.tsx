import _ from "lodash";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../store/actions/application";
import * as USEIO_HOOKS from "../../../../store/hooks";
import { appReducer } from "../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { aarAdresseeDenominationSelector } from "../../aar/store/selectors";
import PN_ROUTES from "../../navigation/routes";
import {
  MessageDetailsContent,
  MessageDetailsContentProps,
  testable
} from "../MessageDetailsContent";
import { SendUserType } from "../../../pushNotifications/analytics";
import { thirdPartyMessage } from "../../__mocks__/pnMessage";
import { IOReceivedNotification } from "../../../../../definitions/pn/IOReceivedNotification";

jest.mock("../../aar/store/selectors", () => ({
  ...jest.requireActual("../../aar/store/selectors"),
  aarAdresseeDenominationSelector: jest
    .fn()
    .mockReturnValue("AAR Denomination"),
  isAarMessageDelegatedSelector: jest.fn().mockReturnValue(true)
}));

const mockMessage = thirdPartyMessage.third_party_message
  .details! as IOReceivedNotification;

const mockMessageWithoutDenomination = _.omit(
  mockMessage,
  "senderDenomination"
);

const mockSelectors = (denomination: string | undefined) => {
  (aarAdresseeDenominationSelector as jest.Mock).mockReturnValue(denomination);
};

describe("MessageDetailsContent component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const sendUserTypes: ReadonlyArray<SendUserType> = [
    "mandatory",
    "not_set",
    "recipient"
  ];
  const testCases = sendUserTypes.flatMap(sendUserType =>
    [true, false].flatMap(hasAarAdresseeDenomination =>
      [true, false].flatMap(isAbstractEnabled =>
        [true, false].map(hasSenderDenomination => ({
          sendUserType,
          hasAarAdresseeDenomination,
          hasSenderDenomination,
          isAbstractEnabled
        }))
      )
    )
  );

  const runSnapshotTest = ({
    sendUserType,
    hasAarAdresseeDenomination,
    hasSenderDenomination,
    isAbstractEnabled
  }: {
    sendUserType: SendUserType;
    hasAarAdresseeDenomination: boolean;
    hasSenderDenomination: boolean;
    isAbstractEnabled: boolean;
  }) => {
    it(`should match snapshot when user type is ${sendUserType}, ${
      hasAarAdresseeDenomination ? "has" : "does not have"
    } a valid Aar Adressee denomination, ${
      hasSenderDenomination ? "has" : "doesn't have"
    } a valid sender denomination, with the abstract ${
      isAbstractEnabled ? "enabled" : "disabled"
    } by feature flag`, () => {
      mockSelectors(
        hasAarAdresseeDenomination ? "AAR Denomination" : undefined
      );
      jest
        .spyOn(USEIO_HOOKS, "useIOSelector")
        .mockReturnValue(isAbstractEnabled);
      const props: MessageDetailsContentProps = {
        message: hasSenderDenomination
          ? mockMessage
          : mockMessageWithoutDenomination,
        sendUserType
      };
      const { toJSON } = renderMessageDetails(props);
      expect(toJSON()).toMatchSnapshot();
    });
  };

  testCases.forEach(runSnapshotTest);
});

describe("MaybeAbstract subcomponent", () => {
  const mockAbstract = "This is a mock abstract";
  it("should render the abstract when provided", () => {
    jest.spyOn(USEIO_HOOKS, "useIOSelector").mockReturnValue(true);
    const { getByTestId } = renderAbstract(mockAbstract);
    expect(getByTestId("abstract")).toBeTruthy();
  });
  it("should not render the abstract when not provided", () => {
    jest.spyOn(USEIO_HOOKS, "useIOSelector").mockReturnValue(true);
    const { queryByTestId } = renderAbstract(undefined);
    expect(queryByTestId("abstract")).not.toBeTruthy();
  });
  it("should not render the abstract when it is an empty string, or only spaces", () => {
    jest.spyOn(USEIO_HOOKS, "useIOSelector").mockReturnValue(true);
    const emptyString = renderAbstract("");
    const withSpaces = renderAbstract(undefined);
    expect(emptyString.queryByTestId("abstract")).not.toBeTruthy();
    expect(withSpaces.queryByTestId("abstract")).not.toBeTruthy();
  });
  it("should not render the abstract when hidden by feature flag", () => {
    jest.spyOn(USEIO_HOOKS, "useIOSelector").mockReturnValue(false);
    const { queryByTestId } = renderAbstract(mockAbstract);
    expect(queryByTestId("abstract")).not.toBeTruthy();
  });
});

const renderMessageDetails = (props: MessageDetailsContentProps) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, globalState as any);
  return renderScreenWithNavigationStoreContext(
    () => (
      <MessageDetailsContent
        message={props.message}
        sendUserType={props.sendUserType}
      />
    ),
    PN_ROUTES.MESSAGE_DETAILS,
    {},
    store
  );
};

const renderAbstract = (props: string | undefined) => {
  const { MaybeAbstract } = testable!;
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, globalState as any);
  return renderScreenWithNavigationStoreContext(
    () => <MaybeAbstract abstract={props} />,
    PN_ROUTES.MESSAGE_DETAILS,
    {},
    store
  );
};
