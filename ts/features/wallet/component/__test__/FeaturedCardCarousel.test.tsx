import * as React from "react";
import configureMockStore, { MockStoreEnhanced } from "redux-mock-store";
import FeaturedCardCarousel from "../card/FeaturedCardCarousel";
import { appReducer } from "../../../../store/reducers";
import { bpdLoadActivationStatus } from "../../../bonus/bpd/store/actions/details";
import { GlobalState } from "../../../../store/reducers/types";
import { availableBonuses } from "../../../bonus/__mock__/availableBonuses";
import * as bonus from "../../../bonus/common/utils";
import { ID_BPD_TYPE, ID_CGN_TYPE } from "../../../bonus/common/utils";
import { BonusVisibilityEnum } from "../../../../../definitions/content/BonusVisibility";
import * as cgnDetailSelectors from "../../../bonus/cgn/store/reducers/details";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { MESSAGES_ROUTES } from "../../../messages/navigation/routes";
import { loadAvailableBonuses } from "../../../bonus/common/store/actions/availableBonusesTypes";

jest.mock("react-native-share", () => jest.fn());
describe("FeaturedCardCarousel", () => {
  it("BPD should not be displayed (FF enabled and BPD enrolled)", () => {
    jest.spyOn(bonus, "mapBonusIdFeatureFlag").mockImplementation(
      () =>
        new Map<number, boolean>([
          [ID_BPD_TYPE, true],
          [ID_CGN_TYPE, false]
        ])
    );
    const mockStore = configureMockStore<GlobalState>();
    const withBpdEnabled: GlobalState = appReducer(
      undefined,
      bpdLoadActivationStatus.success({
        enabled: true,
        activationStatus: "subscribed",
        payoffInstr: undefined
      })
    );
    const withBonusAvailable = appReducer(
      withBpdEnabled,
      loadAvailableBonuses.success(availableBonuses)
    );

    const component = getComponent(mockStore(withBonusAvailable));
    expect(component).toBeDefined();
    const featuredCardCarousel = component.queryByTestId(
      "FeaturedCardCarousel"
    );
    expect(featuredCardCarousel).toBeNull();
    const bpdItem = component.queryByTestId("FeaturedCardBPDTestID");
    // bpd is enrolled so the item should be not displayed
    expect(bpdItem).toBeNull();
  });

  it("BPD should not be displayed (FF not enabled and BPD enrolled)", () => {
    jest.spyOn(bonus, "mapBonusIdFeatureFlag").mockImplementation(
      () =>
        new Map<number, boolean>([
          [ID_BPD_TYPE, false],
          [ID_CGN_TYPE, false]
        ])
    );
    const mockStore = configureMockStore<GlobalState>();
    const withBpdEnabled: GlobalState = appReducer(
      undefined,
      bpdLoadActivationStatus.success({
        enabled: true,
        activationStatus: "subscribed",
        payoffInstr: undefined
      })
    );
    const withBonusAvailable = appReducer(
      withBpdEnabled,
      loadAvailableBonuses.success(availableBonuses)
    );

    const component = getComponent(mockStore(withBonusAvailable));
    expect(component).toBeDefined();
    const featuredCardCarousel = component.queryByTestId(
      "FeaturedCardCarousel"
    );
    expect(featuredCardCarousel).toBeNull();
    const bpdItem = component.queryByTestId("FeaturedCardBPDTestID");
    expect(bpdItem).toBeNull();
  });

  it("BPD should not be displayed (FF not enabled and BPD not enrolled)", () => {
    jest.spyOn(bonus, "mapBonusIdFeatureFlag").mockImplementation(
      // eslint-disable-next-line sonarjs/no-identical-functions
      () =>
        new Map<number, boolean>([
          [ID_BPD_TYPE, false],
          [ID_CGN_TYPE, false]
        ])
    );
    const mockStore = configureMockStore<GlobalState>();
    const withBpdEnabled: GlobalState = appReducer(
      undefined,
      bpdLoadActivationStatus.success({
        enabled: false,
        activationStatus: "never",
        payoffInstr: undefined
      })
    );
    const withBonusAvailable = appReducer(
      withBpdEnabled,
      loadAvailableBonuses.success(availableBonuses)
    );

    const component = getComponent(mockStore(withBonusAvailable));
    expect(component).toBeDefined();
    const featuredCardCarousel = component.queryByTestId(
      "FeaturedCardCarousel"
    );
    expect(featuredCardCarousel).toBeNull();
    const bpdItem = component.queryByTestId("FeaturedCardBPDTestID");
    expect(bpdItem).toBeNull();
  });

  it("BPD should not be displayed (FF enabled and BPD enrolled loading and visibility visible)", () => {
    jest.spyOn(bonus, "mapBonusIdFeatureFlag").mockImplementation(
      // eslint-disable-next-line sonarjs/no-identical-functions
      () =>
        new Map<number, boolean>([
          [ID_BPD_TYPE, true],
          [ID_CGN_TYPE, false]
        ])
    );
    const mockStore = configureMockStore<GlobalState>();
    const withBpdEnabled: GlobalState = appReducer(
      undefined,
      bpdLoadActivationStatus.request()
    );
    const bpdBonus = availableBonuses[1];
    const updatedAvailableBonuses = availableBonuses.filter(
      b => b.id_type !== ID_BPD_TYPE
    );
    const withBonusAvailable = appReducer(
      withBpdEnabled,
      loadAvailableBonuses.success([
        ...updatedAvailableBonuses,
        { ...bpdBonus, visibility: BonusVisibilityEnum.visible }
      ])
    );

    const component = getComponent(mockStore(withBonusAvailable));
    expect(component).toBeDefined();
    const featuredCardCarousel = component.queryByTestId(
      "FeaturedCardCarousel"
    );
    expect(featuredCardCarousel).toBeNull();
    const bpdItem = component.queryByTestId("FeaturedCardBPDTestID");
    expect(bpdItem).toBeNull();
  });

  it("BPD and CGN should be not displayed (FF off, BPD not enrolled, CGN not enrolled)", () => {
    jest.spyOn(bonus, "mapBonusIdFeatureFlag").mockImplementation(
      // eslint-disable-next-line sonarjs/no-identical-functions
      () =>
        new Map<number, boolean>([
          [ID_BPD_TYPE, false],
          [ID_CGN_TYPE, false]
        ])
    );
    jest
      .spyOn(cgnDetailSelectors, "isCgnEnrolledSelector")
      .mockImplementation(() => false);

    const mockStore = configureMockStore<GlobalState>();
    const withBpdEnabled: GlobalState = appReducer(
      undefined,
      bpdLoadActivationStatus.success({
        enabled: false,
        activationStatus: "never",
        payoffInstr: undefined
      })
    );
    const bpdBonus = availableBonuses[1];
    const cgnBonus = availableBonuses[2];
    const updatedAvailableBonuses = availableBonuses.filter(
      b => b.id_type !== ID_BPD_TYPE && b.id_type !== ID_CGN_TYPE
    );
    const withBonusAvailable = appReducer(
      withBpdEnabled,
      loadAvailableBonuses.success([
        ...updatedAvailableBonuses,
        { ...bpdBonus, visibility: BonusVisibilityEnum.visible },
        { ...cgnBonus, visibility: BonusVisibilityEnum.visible }
      ])
    );

    const component = getComponent(mockStore(withBonusAvailable));
    expect(component).toBeDefined();
    const featuredCardCarousel = component.queryByTestId(
      "FeaturedCardCarousel"
    );
    expect(featuredCardCarousel).toBeNull();
    const bpdItem = component.queryByTestId("FeaturedCardBPDTestID");
    expect(bpdItem).toBeNull();
    const cgnItem = component.queryByTestId("FeaturedCardCGNTestID");
    expect(cgnItem).toBeNull();
  });

  it("BPD and CGN should be not displayed (FF on, BPD enrolled, CGN enrolled)", () => {
    jest.spyOn(bonus, "mapBonusIdFeatureFlag").mockImplementation(
      // eslint-disable-next-line sonarjs/no-identical-functions
      () =>
        new Map<number, boolean>([
          [ID_BPD_TYPE, true],
          [ID_CGN_TYPE, true]
        ])
    );
    jest
      .spyOn(cgnDetailSelectors, "isCgnEnrolledSelector")
      .mockImplementation(() => true);

    const mockStore = configureMockStore<GlobalState>();
    const withBpdEnabled: GlobalState = appReducer(
      undefined,
      bpdLoadActivationStatus.success({
        enabled: true,
        activationStatus: "subscribed",
        payoffInstr: undefined
      })
    );
    const bpdBonus = availableBonuses[1];
    const cgnBonus = availableBonuses[2];
    const updatedAvailableBonuses = availableBonuses.filter(
      b => b.id_type !== ID_BPD_TYPE && b.id_type !== ID_CGN_TYPE
    );
    const withBonusAvailable = appReducer(
      withBpdEnabled,
      loadAvailableBonuses.success([
        ...updatedAvailableBonuses,
        { ...bpdBonus, visibility: BonusVisibilityEnum.visible },
        { ...cgnBonus, visibility: BonusVisibilityEnum.visible }
      ])
    );

    const component = getComponent(mockStore(withBonusAvailable));
    expect(component).toBeDefined();
    const featuredCardCarousel = component.queryByTestId(
      "FeaturedCardCarousel"
    );
    expect(featuredCardCarousel).toBeNull();
    const bpdItem = component.queryByTestId("FeaturedCardBPDTestID");
    expect(bpdItem).toBeNull();
    const cgnItem = component.queryByTestId("FeaturedCardCGNTestID");
    expect(cgnItem).toBeNull();
  });

  it("BPD and CGN should be not displayed (FF on, BPD loading, CGN undefined)", () => {
    jest.spyOn(bonus, "mapBonusIdFeatureFlag").mockImplementation(
      // eslint-disable-next-line sonarjs/no-identical-functions
      () =>
        new Map<number, boolean>([
          [ID_BPD_TYPE, true],
          [ID_CGN_TYPE, true]
        ])
    );
    jest
      .spyOn(cgnDetailSelectors, "isCgnEnrolledSelector")
      .mockImplementation(() => undefined);

    const mockStore = configureMockStore<GlobalState>();
    const withBpdEnabled: GlobalState = appReducer(
      undefined,
      bpdLoadActivationStatus.request()
    );
    const bpdBonus = availableBonuses[1];
    const cgnBonus = availableBonuses[2];
    const updatedAvailableBonuses = availableBonuses.filter(
      b => b.id_type !== ID_BPD_TYPE && b.id_type !== ID_CGN_TYPE
    );
    const withBonusAvailable = appReducer(
      withBpdEnabled,
      loadAvailableBonuses.success([
        ...updatedAvailableBonuses,
        { ...bpdBonus, visibility: BonusVisibilityEnum.visible },
        { ...cgnBonus, visibility: BonusVisibilityEnum.visible }
      ])
    );

    const component = getComponent(mockStore(withBonusAvailable));
    expect(component).toBeDefined();
    const featuredCardCarousel = component.queryByTestId(
      "FeaturedCardCarousel"
    );
    expect(featuredCardCarousel).toBeNull();
    const bpdItem = component.queryByTestId("FeaturedCardBPDTestID");
    expect(bpdItem).toBeNull();
    const cgnItem = component.queryByTestId("FeaturedCardCGNTestID");
    expect(cgnItem).toBeNull();
  });

  it("BPD and CGN should be not displayed (FF on, BPD not enrolled, CGN not enrolled, bonus visibility hidden)", () => {
    jest.spyOn(bonus, "mapBonusIdFeatureFlag").mockImplementation(
      // eslint-disable-next-line sonarjs/no-identical-functions
      () =>
        new Map<number, boolean>([
          [ID_BPD_TYPE, true],
          [ID_CGN_TYPE, true]
        ])
    );
    jest
      .spyOn(cgnDetailSelectors, "isCgnEnrolledSelector")
      .mockImplementation(() => false);

    const mockStore = configureMockStore<GlobalState>();
    const withBpdEnabled: GlobalState = appReducer(
      undefined,
      bpdLoadActivationStatus.success({
        enabled: true,
        activationStatus: "subscribed",
        payoffInstr: undefined
      })
    );
    const bpdBonus = availableBonuses[1];
    const cgnBonus = availableBonuses[2];
    const updatedAvailableBonuses = availableBonuses.filter(
      b => b.id_type !== ID_BPD_TYPE && b.id_type !== ID_CGN_TYPE
    );
    const withBonusAvailable = appReducer(
      withBpdEnabled,
      loadAvailableBonuses.success([
        ...updatedAvailableBonuses,
        { ...bpdBonus, visibility: BonusVisibilityEnum.hidden },
        { ...cgnBonus, visibility: BonusVisibilityEnum.hidden }
      ])
    );

    const component = getComponent(mockStore(withBonusAvailable));
    expect(component).toBeDefined();
    const featuredCardCarousel = component.queryByTestId(
      "FeaturedCardCarousel"
    );
    expect(featuredCardCarousel).toBeNull();
    const bpdItem = component.queryByTestId("FeaturedCardBPDTestID");
    expect(bpdItem).toBeNull();
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
