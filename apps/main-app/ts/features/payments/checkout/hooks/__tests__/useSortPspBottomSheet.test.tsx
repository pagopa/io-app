import I18n from "i18next";
import { createStore } from "redux";

import { setLocale } from "../../../../../i18n";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { useIOBottomSheetModal } from "../../../../../utils/hooks/bottomSheet";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { useSortPspBottomSheet } from "../useSortPspBottomSheet";

jest.mock("../../../../../utils/hooks/bottomSheet");

describe("useSortPspBottomSheet", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useIOBottomSheetModal as jest.Mock).mockImplementation(
      ({ component }) => ({
        present: jest.fn(),
        dismiss: jest.fn(),
        bottomSheet: <>{component}</>
      })
    );
  });

  afterEach(() => {
    setLocale("it");
  });

  it("should render the sort options in the locale set after module import", () => {
    setLocale("en");
    const { getByText, getByLabelText } = renderComponent();

    expect(
      getByText(I18n.t("wallet.payment.psp.sortBottomSheet.default"))
    ).toBeTruthy();
    expect(
      getByText(I18n.t("wallet.payment.psp.sortBottomSheet.name"))
    ).toBeTruthy();
    expect(
      getByText(I18n.t("wallet.payment.psp.sortBottomSheet.amount"))
    ).toBeTruthy();
    expect(
      getByLabelText(I18n.t("wallet.payment.psp.sortBottomSheet.a11y.default"))
    ).toBeTruthy();
  });
});

const renderComponent = () => {
  const WrapperComponent = () => {
    const { bottomSheet } = useSortPspBottomSheet({
      onSortChange: jest.fn()
    });
    return <>{bottomSheet}</>;
  };
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);

  return renderScreenWithNavigationStoreContext(
    () => <WrapperComponent />,
    "DUMMY",
    {},
    store
  );
};
