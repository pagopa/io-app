import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { SERVICES_ROUTES } from "../../../common/navigation/routes";
import {
  FeaturedServiceCard,
  FeaturedServiceCardProps
} from "../FeaturedServiceCard";

const testID = "FeaturedServiceCardTestID";

describe("FeaturedServiceCard", () => {
  it(`should match the snapshot`, () => {
    const component = render({
      id: "1",
      name: "### Service ###",
      accessibilityLabel: "### Accessibility Label ###",
      onPress: () => undefined,
      testID
    });
    expect(component).toMatchSnapshot();
  });

  it(`should render card without pressable wrapper`, () => {
    const { queryByTestId } = render({
      id: "1",
      name: "### Service ###",
      accessibilityLabel: "### Accessibility Label ###",
      testID
    });
    expect(queryByTestId(`${testID}-pressable`)).toBeNull();
  });

  it(`should match the snapshot when isNew is true`, () => {
    const component = render({
      id: "1",
      name: "### Service ###",
      accessibilityLabel: "### Accessibility Label ###",
      onPress: () => undefined,
      isNew: true,
      testID
    });
    expect(component).toMatchSnapshot();
  });
});

function render(props: FeaturedServiceCardProps) {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => <FeaturedServiceCard {...props} />,
    SERVICES_ROUTES.SERVICES_HOME,
    {},
    createStore(appReducer, globalState as any)
  );
}
