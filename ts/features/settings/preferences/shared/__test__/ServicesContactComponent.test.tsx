import { fireEvent } from "@testing-library/react-native";
import I18n from "i18next";
import { createStore } from "redux";

import { ServicesPreferencesModeEnum } from "../../../../../../definitions/backend/ServicesPreferencesMode";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import ServicesContactComponent from "../components/ServicesContactComponent";

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
