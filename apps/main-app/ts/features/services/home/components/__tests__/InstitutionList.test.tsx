import { Institution } from "@io-app/api-types/generated/definitions/services/Institution";
import { FlatList } from "react-native";
import Animated, { useAnimatedRef } from "react-native-reanimated";
import configureMockStore from "redux-mock-store";

import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { SERVICES_ROUTES } from "../../../common/navigation/routes";
import { InstitutionList } from "../InstitutionList";

describe("InstitutionList", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it("automatically insets institutions above the native tab bar", () => {
    const state = appReducer(undefined, applicationChangeState("active"));
    const { UNSAFE_getByType } = renderScreenWithNavigationStoreContext(
      () => {
        const scrollViewContentRef =
          useAnimatedRef<Animated.FlatList<Institution>>();
        return <InstitutionList scrollViewContentRef={scrollViewContentRef} />;
      },
      SERVICES_ROUTES.SERVICES_HOME,
      {},
      configureMockStore<GlobalState>()(state)
    );

    expect(
      UNSAFE_getByType(FlatList).props.contentInsetAdjustmentBehavior
    ).toBe("automatic");
  });
});
