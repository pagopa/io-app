import * as React from "react";
import configureMockStore, { MockStoreEnhanced } from "redux-mock-store";
import { BonusVisibilityEnum } from "../../../../../definitions/content/BonusVisibility";
import { appReducer } from "../../../../store/reducers";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { availableBonuses } from "../../../bonus/__mock__/availableBonuses";
import * as cgnDetailSelectors from "../../../bonus/cgn/store/reducers/details";
import { loadAvailableBonuses } from "../../../bonus/common/store/actions/availableBonusesTypes";
import * as bonus from "../../../bonus/common/utils";
import { ID_CGN_TYPE } from "../../../bonus/common/utils";
import { MESSAGES_ROUTES } from "../../../messages/navigation/routes";
import FeaturedCardCarousel from "../card/FeaturedCardCarousel";

jest.mock("react-native-share", () => jest.fn());
describe("FeaturedCardCarousel", () => {
  it("CGN should be not displayed (FF off, CGN not enrolled)", () => {
    jest.spyOn(bonus, "mapBonusIdFeatureFlag").mockImplementation(
      // eslint-disable-next-line sonarjs/no-identical-functions
      () => new Map<number, boolean>([[ID_CGN_TYPE, false]])
    );
    jest
      .spyOn(cgnDetailSelectors, "isCgnEnrolledSelector")
      .mockImplementation(() => false);

    const mockStore = configureMockStore<GlobalState>();
    const cgnBonus = availableBonuses[2];
    const updatedAvailableBonuses = availableBonuses.filter(
      b => b.id_type !== ID_CGN_TYPE
    );
    const withBonusAvailable = appReducer(
      undefined,
      loadAvailableBonuses.success([
        ...updatedAvailableBonuses,
        { ...cgnBonus, visibility: BonusVisibilityEnum.visible }
      ])
    );

    const component = getComponent(mockStore(withBonusAvailable));
    expect(component).toBeDefined();
    const featuredCardCarousel = component.queryByTestId(
      "FeaturedCardCarousel"
    );
    expect(featuredCardCarousel).toBeNull();
    const cgnItem = component.queryByTestId("FeaturedCardCGNTestID");
    expect(cgnItem).toBeNull();
  });

  it("CGN should be not displayed (FF on, CGN enrolled)", () => {
    jest.spyOn(bonus, "mapBonusIdFeatureFlag").mockImplementation(
      // eslint-disable-next-line sonarjs/no-identical-functions
      () => new Map<number, boolean>([[ID_CGN_TYPE, true]])
    );
    jest
      .spyOn(cgnDetailSelectors, "isCgnEnrolledSelector")
      .mockImplementation(() => true);

    const mockStore = configureMockStore<GlobalState>();
    const cgnBonus = availableBonuses[2];
    const updatedAvailableBonuses = availableBonuses.filter(
      b => b.id_type !== ID_CGN_TYPE
    );
    const withBonusAvailable = appReducer(
      undefined,
      loadAvailableBonuses.success([
        ...updatedAvailableBonuses,
        { ...cgnBonus, visibility: BonusVisibilityEnum.visible }
      ])
    );

    const component = getComponent(mockStore(withBonusAvailable));
    expect(component).toBeDefined();
    const featuredCardCarousel = component.queryByTestId(
      "FeaturedCardCarousel"
    );
    expect(featuredCardCarousel).toBeNull();
    const cgnItem = component.queryByTestId("FeaturedCardCGNTestID");
    expect(cgnItem).toBeNull();
  });

  it("CGN should be not displayed (FF on, CGN undefined)", () => {
    jest.spyOn(bonus, "mapBonusIdFeatureFlag").mockImplementation(
      // eslint-disable-next-line sonarjs/no-identical-functions
      () => new Map<number, boolean>([[ID_CGN_TYPE, true]])
    );
    jest
      .spyOn(cgnDetailSelectors, "isCgnEnrolledSelector")
      .mockImplementation(() => undefined);

    const mockStore = configureMockStore<GlobalState>();
    const cgnBonus = availableBonuses[2];
    const updatedAvailableBonuses = availableBonuses.filter(
      b => b.id_type !== ID_CGN_TYPE
    );
    const withBonusAvailable = appReducer(
      undefined,
      loadAvailableBonuses.success([
        ...updatedAvailableBonuses,
        { ...cgnBonus, visibility: BonusVisibilityEnum.visible }
      ])
    );

    const component = getComponent(mockStore(withBonusAvailable));
    expect(component).toBeDefined();
    const featuredCardCarousel = component.queryByTestId(
      "FeaturedCardCarousel"
    );
    expect(featuredCardCarousel).toBeNull();
    const cgnItem = component.queryByTestId("FeaturedCardCGNTestID");
    expect(cgnItem).toBeNull();
  });

  it("CGN should be not displayed (FF on, CGN not enrolled, bonus visibility hidden)", () => {
    jest.spyOn(bonus, "mapBonusIdFeatureFlag").mockImplementation(
      // eslint-disable-next-line sonarjs/no-identical-functions
      () => new Map<number, boolean>([[ID_CGN_TYPE, true]])
    );
    jest
      .spyOn(cgnDetailSelectors, "isCgnEnrolledSelector")
      .mockImplementation(() => false);

    const mockStore = configureMockStore<GlobalState>();
    const cgnBonus = availableBonuses[2];
    const updatedAvailableBonuses = availableBonuses.filter(
      b => b.id_type !== ID_CGN_TYPE
    );
    const withBonusAvailable = appReducer(
      undefined,
      loadAvailableBonuses.success([
        ...updatedAvailableBonuses,
        { ...cgnBonus, visibility: BonusVisibilityEnum.hidden }
      ])
    );

    const component = getComponent(mockStore(withBonusAvailable));
    expect(component).toBeDefined();
    const featuredCardCarousel = component.queryByTestId(
      "FeaturedCardCarousel"
    );
    expect(featuredCardCarousel).toBeNull();
    const cgnItem = component.queryByTestId("FeaturedCardCGNTestID");
    expect(cgnItem).toBeNull();
  });
});

const getComponent = (mockStore: MockStoreEnhanced<GlobalState>) =>
  renderScreenWithNavigationStoreContext<GlobalState>(
    () => <FeaturedCardCarousel />,
    MESSAGES_ROUTES.MESSAGE_DETAIL,
    {},
    mockStore
  );
