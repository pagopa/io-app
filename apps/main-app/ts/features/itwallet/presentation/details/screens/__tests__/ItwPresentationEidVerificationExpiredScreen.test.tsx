import { fireEvent, render } from "@testing-library/react-native";
import I18n from "i18next";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import { useIONavigation } from "../../../../../../navigation/params/AppParamsList.ts";
import { ITW_ROUTES } from "../../../../navigation/routes.ts";
import { ItwEidReissuingTrigger } from "../../analytics/types";
import { ItwPresentationEidVerificationExpiredScreen } from "../ItwPresentationEidVerificationExpiredScreen";

const mockNavigate = jest.fn();
const mockPresent = jest.fn();
const mockTrackItwSurveyRequest = jest.fn();
const mockTrackItwEidReissuingMandatory = jest.fn();
const mockTrackItwEidReissuingMandatoryConfirm = jest.fn();
const mockTrackItwEidReissuingMandatoryCancel = jest.fn();

jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useRoute: jest.fn(),
  useFocusEffect: jest.fn()
}));

jest.mock("../../../../../../navigation/params/AppParamsList.ts", () => ({
  ...jest.requireActual("../../../../../../navigation/params/AppParamsList.ts"),
  useIONavigation: jest.fn()
}));

jest.mock("../../../../common/hooks/useItwEidFeedbackBottomSheet.tsx", () => ({
  useItwEidFeedbackBottomSheet: () => ({
    present: mockPresent,
    bottomSheet: null
  })
}));

jest.mock("../../../../analytics", () => ({
  ...jest.requireActual("../../../../analytics"),
  trackItwSurveyRequest: (properties: unknown) =>
    mockTrackItwSurveyRequest(properties)
}));

jest.mock("../../analytics", () => ({
  ...jest.requireActual("../../analytics"),
  trackItwEidReissuingMandatory: (action: unknown) =>
    mockTrackItwEidReissuingMandatory(action),
  trackItwEidReissuingMandatoryConfirm: (action: unknown) =>
    mockTrackItwEidReissuingMandatoryConfirm(action),
  trackItwEidReissuingMandatoryCancel: (action: unknown) =>
    mockTrackItwEidReissuingMandatoryCancel(action)
}));

describe("ItwPresentationEidVerificationExpiredScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useIONavigation as jest.Mock).mockReturnValue({
      navigate: mockNavigate,
      popToTop: jest.fn()
    });
    (useRoute as jest.Mock).mockReturnValue({
      name: "ITW_PRESENTATION_EID_VERIFICATION_EXPIRED"
    });
    (useFocusEffect as jest.Mock).mockImplementation(callback => callback());
  });

  it("tracks the KO screen view on render", () => {
    render(<ItwPresentationEidVerificationExpiredScreen />);

    expect(mockTrackItwEidReissuingMandatory).toHaveBeenCalledWith(
      ItwEidReissuingTrigger.ADD_CREDENTIAL
    );
  });

  it("tracks confirm and starts the eID reissuing flow", () => {
    const component = render(<ItwPresentationEidVerificationExpiredScreen />);

    fireEvent.press(
      component.getByText(
        I18n.t(
          "features.itWallet.presentation.eid.verificationExpired.primaryAction"
        )
      )
    );

    expect(mockTrackItwEidReissuingMandatoryConfirm).toHaveBeenCalledWith(
      ItwEidReissuingTrigger.ADD_CREDENTIAL
    );
    expect(mockNavigate).toHaveBeenCalledWith(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.IDENTIFICATION.MODE_SELECTION,
      params: {
        eidReissuing: true
      }
    });
  });

  it("tracks cancel and opens the feedback bottom sheet", () => {
    const component = render(<ItwPresentationEidVerificationExpiredScreen />);

    fireEvent.press(component.getByText(I18n.t("global.buttons.cancel")));

    expect(mockTrackItwEidReissuingMandatoryCancel).toHaveBeenCalledWith(
      ItwEidReissuingTrigger.ADD_CREDENTIAL
    );
    expect(mockTrackItwSurveyRequest).toHaveBeenCalledWith({
      survey_id: "confirm_eid_flow_exit",
      survey_page: "ITW_PRESENTATION_EID_VERIFICATION_EXPIRED"
    });
    expect(mockPresent).toHaveBeenCalledTimes(1);
  });
});
