import * as pot from "@pagopa/ts-commons/lib/pot";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import { ID_CDC_TYPE } from "../../../../common/utils";
import CdcBonusRequestInformationTos from "../CdcBonusRequestInformationTos";
import { CDC_ROUTES } from "../../../common/navigation/routes";

const renderComponent = (state: GlobalState) => {
  const store = createStore(appReducer, state as any);

  return renderScreenWithNavigationStoreContext(
    () => <CdcBonusRequestInformationTos />,
    CDC_ROUTES.CDC_INFORMATION_TOS,
    {},
    store
  );
};

const globalState = appReducer(undefined, applicationChangeState("active"));

// Mock CDC info for testing
const mockCdcInfo = {
  id_type: ID_CDC_TYPE,
  is_active: true,
  it: {
    name: "Carta della cultura",
    title: "Carta della cultura",
    subtitle: "Sottotitolo della carta",
    content: "Contenuto della carta della cultura",
    description: "Descrizione della carta della cultura",
    tos_url: "https://example.com/tos",
    urls: []
  },
  en: {
    name: "Carta della cultura",
    title: "Carta della cultura",
    subtitle: "Sottotitolo della carta",
    content: "Contenuto della carta della cultura",
    description: "Descrizione della carta della cultura",
    tos_url: "https://example.com/tos",
    urls: []
  },
  valid_from: new Date(),
  valid_to: new Date()
};

// Create a state with CDC info
const stateWithCdcInfo: GlobalState = {
  ...globalState,
  bonus: {
    ...globalState.bonus,
    availableBonusTypes: pot.some([
      ...Object.values(globalState.bonus.availableBonusTypes || {}),
      mockCdcInfo
    ])
  }
};

describe("CdcBonusRequestInformationTos", () => {
  it("should render CDC content when info is available", () => {
    const { getAllByText } = renderComponent(stateWithCdcInfo);

    expect(getAllByText(mockCdcInfo.it.title).length).toBeGreaterThan(0);
  });

  it("should not render when CDC info is not available", () => {
    const { queryByText } = renderComponent(globalState);

    expect(queryByText(mockCdcInfo.it.title)).toBeNull();
  });
});
