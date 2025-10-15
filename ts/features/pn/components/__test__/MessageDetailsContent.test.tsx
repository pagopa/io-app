import * as O from "fp-ts/Option";
import _ from "lodash";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../store/actions/application";
import * as USEIO_HOOKS from "../../../../store/hooks";
import { appReducer } from "../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { thirdPartyMessage } from "../../__mocks__/pnMessage";
import {
  aarAdresseeDenominationSelector,
  isAarMessageDelegatedSelector
} from "../../aar/store/selectors";
import PN_ROUTES from "../../navigation/routes";
import { toPNMessage } from "../../store/types/transformers";
import { PNMessage } from "../../store/types/types";
import { MessageDetailsContent, testable } from "../MessageDetailsContent";

jest.mock("../../aar/store/selectors", () => ({
  ...jest.requireActual("../../aar/store/selectors"),
  aarAdresseeDenominationSelector: jest
    .fn()
    .mockReturnValue("AAR Denomination"),
  isAarMessageDelegatedSelector: jest.fn().mockReturnValue(true)
}));

const mockMessage = O.toUndefined(toPNMessage(thirdPartyMessage))!;
const mockMessageWithoutDenomination = _.omit(
  mockMessage,
  "senderDenomination"
);

const mockSelectors = (
  denomination: string | undefined,
  isDelegated: boolean
) => {
  (aarAdresseeDenominationSelector as jest.Mock).mockReturnValue(denomination);
  (isAarMessageDelegatedSelector as jest.Mock).mockReturnValue(isDelegated);
};

describe("MessageDetailsContent component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const testCases = [true, false].flatMap(isDelegated =>
    [true, false].flatMap(hasAarAdresseeDenomination =>
      [true, false].map(hasSenderDenomination => ({
        isDelegated,
        hasAarAdresseeDenomination,
        hasSenderDenomination
      }))
    )
  );

  const runSnapshotTest = ({
    isDelegated,
    hasAarAdresseeDenomination,
    hasSenderDenomination
  }: {
    isDelegated: boolean;
    hasAarAdresseeDenomination: boolean;
    hasSenderDenomination: boolean;
  }) => {
    it(`should match snapshot when ${isDelegated ? "is" : "isn't"} delegated, ${
      hasAarAdresseeDenomination ? "has" : "does not have"
    } a valid Aar Adressee denomination, ${
      hasSenderDenomination ? "has" : "doesn't have"
    } a valid sender denomination`, () => {
      mockSelectors(
        hasAarAdresseeDenomination ? "AAR Denomination" : undefined,
        isDelegated
      );
      const { toJSON } = renderMessageDetails(
        hasSenderDenomination ? mockMessage : mockMessageWithoutDenomination
      );
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

const renderMessageDetails = (props: PNMessage) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, globalState as any);
  return renderScreenWithNavigationStoreContext(
    () => <MessageDetailsContent message={props} />,
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
