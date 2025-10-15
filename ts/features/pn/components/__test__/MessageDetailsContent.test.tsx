import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/lib/function";
import _ from "lodash";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../store/actions/application";
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
import { MessageDetailsContent } from "../MessageDetailsContent";

jest.mock("../../aar/store/selectors", () => ({
  ...jest.requireActual("../../aar/store/selectors"),
  aarAdresseeDenominationSelector: jest
    .fn()
    .mockReturnValue("AAR Denomination"),
  isAarMessageDelegatedSelector: jest.fn().mockReturnValue(true)
}));

const mockMessage = pipe(thirdPartyMessage, toPNMessage, O.toUndefined)!;
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
      const { toJSON } = renderComponent(
        hasSenderDenomination ? mockMessage : mockMessageWithoutDenomination
      );
      expect(toJSON()).toMatchSnapshot();
    });
  };

  testCases.forEach(runSnapshotTest);
});

const renderComponent = (props: PNMessage) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, globalState as any);
  return renderScreenWithNavigationStoreContext(
    () => <MessageDetailsContent message={props} />,
    PN_ROUTES.MESSAGE_DETAILS,
    {},
    store
  );
};
