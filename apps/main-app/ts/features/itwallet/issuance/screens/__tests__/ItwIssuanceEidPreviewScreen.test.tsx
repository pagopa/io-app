import I18n from "i18next";
import { createStore } from "redux";
import { createActor, type StateFrom } from "xstate";

import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { ItwStoredCredentialsMocks } from "../../../common/utils/itwMocksUtils";
import {
  ItwEidIssuanceMachine,
  itwEidIssuanceMachine
} from "../../../machine/eid/machine";
import { ItwTags } from "../../../machine/tags";
import { ITW_ROUTES } from "../../../navigation/routes";
import { ItwIssuanceEidPreviewScreen } from "../ItwIssuanceEidPreviewScreen";

const mockSend = jest.fn();
const mockUseSelector = jest.fn();

type MachineSelector<T> = (snapshot: MachineSnapshot) => T;
type MachineSnapshot = StateFrom<ItwEidIssuanceMachine>;

jest.mock("../../../machine/eid/provider", () => {
  const actual = jest.requireActual("../../../machine/eid/provider");
  return {
    ...actual,
    ItwEidIssuanceMachineContext: {
      ...actual.ItwEidIssuanceMachineContext,
      useActorRef: () => ({ send: mockSend }),
      useSelector: <T,>(selector: MachineSelector<T>) =>
        mockUseSelector(selector)
    }
  };
});

describe("ItwIssuanceEidPreviewScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the loading content while the issued eID identity is still being checked", () => {
    const { getByText, queryByText } = renderComponent({
      value: { Issuance: "CheckingIdentityMatch" },
      tags: new Set([ItwTags.Loading])
    });

    expect(getByText(I18n.t("global.genericWaiting"))).toBeTruthy();
    expect(
      queryByText(I18n.t("features.itWallet.issuance.eidPreview.title"))
    ).toBeNull();
  });
});

const renderComponent = ({
  value,
  tags
}: {
  tags: Set<ItwTags>;
  value: { Issuance: "CheckingIdentityMatch" | "DisplayingPreview" };
}) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const initialSnapshot = createActor(itwEidIssuanceMachine).getSnapshot();
  const snapshot: MachineSnapshot = {
    ...initialSnapshot,
    value,
    tags,
    context: {
      ...initialSnapshot.context,
      level: "l2",
      eid: {
        credential: "",
        metadata: ItwStoredCredentialsMocks.eid
      }
    }
  };

  mockUseSelector.mockImplementation((selector: MachineSelector<unknown>) =>
    selector(snapshot)
  );

  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => <ItwIssuanceEidPreviewScreen />,
    ITW_ROUTES.ISSUANCE.EID_PREVIEW,
    {},
    createStore(appReducer, initialState as any)
  );
};
