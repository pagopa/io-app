import {
  CommonActions,
  ParamListBase,
  StackNavigationState,
  StackRouter
} from "@react-navigation/native";
import _ from "lodash";
import { ActionArgs } from "xstate";

import ROUTES from "../../../../../navigation/routes";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { itwShowBanner } from "../../../common/store/actions/banners";
import { itwSetL2Fallback } from "../../../common/store/actions/preferences";
import {
  itwSetActivationExitSurvey,
  itwSetFeedbackBottomSheetVisible
} from "../../../common/store/actions/ui";
import { ITW_ROUTES } from "../../../navigation/routes";
import { testEidIssuanceDeps, testMachineStore } from "../../utils/testDeps";
import {
  closeIssuanceAction,
  navigateToCiePinPreparationScreenAction,
  navigateToCredentialCatalogAction,
  navigateToWalletAction,
  storeL2FallbackAction,
  storeWalletActivationFeedbackBannerDataAction
} from "../actions";
import {
  Context,
  EidIssuanceLevel,
  EidIssuanceMode,
  InitialContext
} from "../context";
import { EidIssuanceEvents } from "../events";

type EidActionArgs = ActionArgs<Context, EidIssuanceEvents, EidIssuanceEvents>;

const baseState = appReducer(undefined, applicationChangeState("active"));

const buildArgs = ({
  mode,
  level,
  event = { type: "close" },
  isSurveyHidden = false,
  credentialType
}: {
  credentialType?: string;
  event?: EidIssuanceEvents;
  isSurveyHidden?: boolean;
  level: EidIssuanceLevel;
  mode: EidIssuanceMode;
}) => {
  const dispatch = jest.fn();
  const state: GlobalState = _.set(
    _.cloneDeep(baseState),
    "features.itWallet.preferences.isPidReissuingSurveyHidden",
    isSurveyHidden
  );
  const deps = testEidIssuanceDeps({
    store: testMachineStore({ dispatch, getState: () => state })
  });
  const args = {
    context: { ...InitialContext, deps, mode, level, credentialType },
    event
  } as unknown as EidActionArgs;
  return { args, dispatch };
};

describe("navigateToCredentialCatalogAction", () => {
  test.each<{ expected: string; level: EidIssuanceLevel; name: string }>([
    {
      name: "L2 fallback",
      level: "l2-fallback",
      expected: ITW_ROUTES.L3_ONBOARDING
    },
    { name: "IT-Wallet", level: "l3", expected: ITW_ROUTES.L3_ONBOARDING },
    {
      name: "legacy Documenti su IO",
      level: "l2",
      expected: ITW_ROUTES.ONBOARDING
    }
  ])(
    "opens the correct catalogue after $name activation",
    ({ level, expected }) => {
      const { args } = buildArgs({ level, mode: "issuance" });
      const replace = jest.spyOn(args.context.deps.navigation, "replace");
      navigateToCredentialCatalogAction(args);
      expect(replace).toHaveBeenCalledWith(ITW_ROUTES.MAIN, {
        screen: expected
      });
    }
  );
});

// React Navigation v7 `navigate` pushes a second main navigator instead of popping back to it
describe("wallet return navigation", () => {
  test.each([
    { name: "navigateToWalletAction", action: navigateToWalletAction },
    { name: "closeIssuanceAction", action: closeIssuanceAction }
  ])("$name pops back to the existing wallet", ({ action }) => {
    const { args } = buildArgs({ level: "l3", mode: "issuance" });
    const { navigation } = args.context.deps;
    const popTo = jest.spyOn(navigation, "popTo");
    const navigate = jest.spyOn(navigation, "navigate");
    action(args);
    expect(popTo).toHaveBeenCalledWith(
      ROUTES.MAIN,
      expect.objectContaining({ screen: ROUTES.WALLET_HOME })
    );
    expect(navigate).not.toHaveBeenCalled();
  });
});

describe("back target navigation", () => {
  it("pops back to an existing screen instead of pushing a duplicate", () => {
    const { PIN_SCREEN, PREPARATION } = ITW_ROUTES.IDENTIFICATION.CIE;
    const routeNames = [PREPARATION.PIN_SCREEN, PIN_SCREEN];
    const config = { routeNames, routeParamList: {}, routeGetIdList: {} };
    const router = StackRouter({});
    const state = router.getStateForAction(
      router.getInitialState(config),
      CommonActions.navigate(PIN_SCREEN),
      config
    ) as StackNavigationState<ParamListBase>;

    const { args } = buildArgs({ level: "l3", mode: "issuance" });
    const navigate = jest.spyOn(args.context.deps.navigation, "navigate");
    navigateToCiePinPreparationScreenAction(args);
    const [, { screen, pop }] = navigate.mock.calls[0] as unknown as [
      string,
      { pop?: boolean; screen: string }
    ];

    const nextState = router.getStateForAction(
      state,
      { type: "NAVIGATE", payload: { name: screen, pop } },
      config
    );
    expect(nextState?.routes.map(({ name }) => name)).toEqual([
      PREPARATION.PIN_SCREEN
    ]);
  });
});

describe("storeL2FallbackAction", () => {
  test.each<{
    expected: boolean;
    level: EidIssuanceLevel;
    mode: EidIssuanceMode;
    name: string;
  }>([
    {
      name: "fallback activation",
      mode: "issuance",
      level: "l2-fallback",
      expected: true
    },
    {
      name: "standard L2 activation",
      mode: "issuance",
      level: "l2",
      expected: false
    },
    { name: "L3 activation", mode: "issuance", level: "l3", expected: false },
    { name: "L3 upgrade", mode: "upgrade", level: "l3", expected: false },
    { name: "L3 reissuance", mode: "reissuance", level: "l3", expected: false }
  ])("records fallback provenance for $name", ({ mode, level, expected }) => {
    const { args, dispatch } = buildArgs({ mode, level });
    storeL2FallbackAction(args);
    expect(dispatch).toHaveBeenCalledWith(itwSetL2Fallback(expected));
  });

  it("preserves fallback provenance during L2 reissuance", () => {
    const { args, dispatch } = buildArgs({ mode: "reissuance", level: "l2" });
    storeL2FallbackAction(args);
    expect(dispatch).not.toHaveBeenCalled();
  });
});

describe("closeIssuanceAction", () => {
  // SIW-5129: the reissuance survey is reserved to Documenti su IO (L2) reissuance
  it("shows the reissuance survey on Documenti su IO (L2) reissuance exit", () => {
    const { args, dispatch } = buildArgs({ mode: "reissuance", level: "l2" });
    closeIssuanceAction(args);
    expect(dispatch).toHaveBeenCalledWith(
      itwSetFeedbackBottomSheetVisible(true)
    );
  });

  it("does not show any survey on IT-Wallet (L3) reissuance exit", () => {
    const { args, dispatch } = buildArgs({
      mode: "reissuance",
      level: "l3",
      event: { type: "close", surveyStep: "select_method" }
    });
    closeIssuanceAction(args);
    expect(dispatch).not.toHaveBeenCalledWith(
      itwSetFeedbackBottomSheetVisible(true)
    );
    expect(dispatch).not.toHaveBeenCalledWith(
      itwSetActivationExitSurvey({ step: "select_method" })
    );
  });

  it("does not show the reissuance survey when the user already answered it", () => {
    const { args, dispatch } = buildArgs({
      mode: "reissuance",
      level: "l2",
      isSurveyHidden: true
    });
    closeIssuanceAction(args);
    expect(dispatch).not.toHaveBeenCalledWith(
      itwSetFeedbackBottomSheetVisible(true)
    );
  });

  // SIW-4993: the IT-Wallet activation exit survey must never leak into Documenti su IO flows
  test.each<{ level: EidIssuanceLevel; name: string }>([
    { name: "Documenti su IO (L2)", level: "l2" },
    { name: "Documenti su IO fallback from IT-Wallet", level: "l2-fallback" }
  ])("does not show any survey on $name issuance exit", ({ level }) => {
    const { args, dispatch } = buildArgs({
      mode: "issuance",
      level,
      event: { type: "close", surveyStep: "select_method" }
    });
    closeIssuanceAction(args);
    expect(dispatch).not.toHaveBeenCalledWith(
      itwSetFeedbackBottomSheetVisible(true)
    );
    expect(dispatch).not.toHaveBeenCalledWith(
      itwSetActivationExitSurvey({ step: "select_method" })
    );
  });

  it("shows the activation exit survey on IT-Wallet (L3) issuance exit", () => {
    const { args, dispatch } = buildArgs({
      mode: "issuance",
      level: "l3",
      event: { type: "close", surveyStep: "select_method" }
    });
    closeIssuanceAction(args);
    expect(dispatch).toHaveBeenCalledWith(
      itwSetActivationExitSurvey({ step: "select_method" })
    );
  });
});

describe("storeWalletActivationFeedbackBannerDataAction", () => {
  test.each<{ level: EidIssuanceLevel; mode: EidIssuanceMode; name: string }>([
    {
      name: "Documenti su IO fallback",
      mode: "issuance",
      level: "l2-fallback"
    },
    { name: "Documenti su IO", mode: "issuance", level: "l2" },
    { name: "Documenti su IO reissuance", mode: "reissuance", level: "l2" }
  ])(
    "does not show the IT-Wallet activation banner for $name",
    ({ mode, level }) => {
      const { args, dispatch } = buildArgs({
        mode,
        level,
        credentialType: "mDL"
      });
      storeWalletActivationFeedbackBannerDataAction(args);
      expect(dispatch).not.toHaveBeenCalledWith(
        itwShowBanner("activationSuccessFeedback")
      );
    }
  );
});
