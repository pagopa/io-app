import _ from "lodash";
import { ActionArgs } from "xstate";

import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { itwShowBanner } from "../../../common/store/actions/banners";
import {
  itwSetActivationExitSurvey,
  itwSetFeedbackBottomSheetVisible
} from "../../../common/store/actions/ui";
import { testEidIssuanceDeps, testMachineStore } from "../../utils/testDeps";
import {
  closeIssuanceAction,
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
