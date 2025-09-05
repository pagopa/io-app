import { fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";
import I18n from "i18next";
import ServicesContactComponent from "../components/ServicesContactComponent";
import { ServicesPreferencesModeEnum } from "../../../../../../definitions/backend/ServicesPreferencesMode";
import { appReducer } from "../../../../../store/reducers";
import { applicationChangeState } from "../../../../../store/actions/application";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";

describe("ServicesContactComponent", () => {
  it("should NOT call onSelectMode if the same mode is selected", () => {
    const mockOnSelectMode = jest.fn();

    const { getByText } = renderComponent(ServicesPreferencesModeEnum.AUTO);

    fireEvent.press(
      getByText(I18n.t("services.optIn.preferences.quickConfig.title"))
    );

    expect(mockOnSelectMode).not.toHaveBeenCalled();
  });
});

const renderComponent = (mode?: ServicesPreferencesModeEnum) => {
  const mockOnSelectMode = jest.fn();

  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);
  return renderScreenWithNavigationStoreContext(
    () => (
      <ServicesContactComponent mode={mode} onSelectMode={mockOnSelectMode} />
    ),
    "DUMMY",
    {},
    store
  );
};
