import { createStore } from "redux";
import { fireEvent } from "@testing-library/react-native";
import I18n from "i18next";
import { useManualConfigBottomSheet } from "../hooks/useManualConfigBottomSheet";
import { useIOBottomSheetModal } from "../../../../../utils/hooks/bottomSheet";
import { appReducer } from "../../../../../store/reducers";
import { applicationChangeState } from "../../../../../store/actions/application";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";

jest.mock("../../../../../utils/hooks/bottomSheet");
jest.mock("../../../../../i18n");

const mockPresent = jest.fn();
const mockDismiss = jest.fn();

describe("useManualConfigBottomSheet", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useIOBottomSheetModal as jest.Mock).mockImplementation(
      ({ component, footer }) => ({
        present: mockPresent,
        dismiss: mockDismiss,
        bottomSheet: (
          <>
            {component}
            {footer}
          </>
        )
      })
    );
  });

  it("should match snapshot", () => {
    const tree = renderComponent().toJSON();
    expect(tree).toMatchSnapshot();
  });

  it("should render bottom sheet content", () => {
    const { getByText } = renderComponent();

    expect(
      getByText(
        I18n.t("services.optIn.preferences.manualConfig.bottomSheet.body")
      )
    ).toBeTruthy();
    expect(getByText(I18n.t("global.buttons.cancel"))).toBeTruthy();
    expect(getByText(I18n.t("global.buttons.confirm"))).toBeTruthy();
  });

  it("should call dismiss when cancel is pressed", () => {
    const { getByText } = renderComponent();

    fireEvent.press(getByText(I18n.t("global.buttons.cancel")));
    expect(mockDismiss).toHaveBeenCalled();
  });

  it("should call onConfirm and dismiss when confirm is pressed", () => {
    const onConfirm = jest.fn();
    const { getByText } = renderComponent(onConfirm);

    fireEvent.press(getByText(I18n.t("global.buttons.confirm")));
    expect(onConfirm).toHaveBeenCalled();
    expect(mockDismiss).toHaveBeenCalled();
  });
});

const renderComponent = (onConfirm?: () => void) => {
  const WrapperComponent = () => {
    const { manualConfigBottomSheet } = useManualConfigBottomSheet(
      onConfirm ? onConfirm : jest.fn()
    );
    return <>{manualConfigBottomSheet}</>;
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
