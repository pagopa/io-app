import { Platform } from "react-native";
import { fireEvent, render } from "@testing-library/react-native";
import CieIdNotInstalled, {
  CIE_ID_ANDROID_COLL_LINK,
  CIE_ID_ANDROID_LINK,
  CIE_ID_IOS_LINK
} from "../CieIdNotInstalled";
import * as urlUtils from "../../../../../../utils/url";
import { withStore } from "../../../../../../utils/jest/withStore";

const UAT_ENV_ENABLE_STATES = [true, false];

const mockPopToTop = jest.fn();
const mockOpenUrl = jest.spyOn(urlUtils, "openWebUrl");
const anyFunction = expect.any(Function);

// Wrap the component with store
const CieIdNotInstalledWithStore = withStore(CieIdNotInstalled);

jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useNavigation: () => ({
    popToTop: mockPopToTop
  })
}));

describe(CieIdNotInstalled, () => {
  afterEach(jest.clearAllMocks);
  it("Should match the snapshot", () => {
    const component = render(<CieIdNotInstalledWithStore isUat={false} />);

    expect(component).toMatchSnapshot();
  });

  describe("Behavior on iOS", () => {
    UAT_ENV_ENABLE_STATES.forEach(uatState => {
      it("Should open CIE_ID_IOS_LINK", async () => {
        const { getByTestId } = render(
          <CieIdNotInstalledWithStore isUat={uatState} />
        );

        const openStore = getByTestId("cie-id-not-installed-open-store");
        fireEvent.press(openStore);

        expect(mockOpenUrl).toHaveBeenCalledWith(CIE_ID_IOS_LINK, anyFunction);
        expect(mockPopToTop).not.toHaveBeenCalled();
      });
    });
  });
  describe("Behavior on Android", () => {
    it("Should open CIE_ID_ANDROID_LINK", () => {
      jest.spyOn(Platform, "select").mockReturnValue(CIE_ID_ANDROID_LINK);

      const { getByTestId } = render(
        <CieIdNotInstalledWithStore isUat={false} />
      );

      const openStore = getByTestId("cie-id-not-installed-open-store");
      fireEvent.press(openStore);

      expect(mockOpenUrl).toHaveBeenCalledWith(
        CIE_ID_ANDROID_LINK,
        anyFunction
      );
      expect(mockPopToTop).not.toHaveBeenCalled();
    });
    it("Should open CIE_ID_ANDROID_COLL_LINK", () => {
      jest.spyOn(Platform, "select").mockReturnValue(CIE_ID_ANDROID_COLL_LINK);

      const { getByTestId } = render(<CieIdNotInstalledWithStore isUat />);

      const openStore = getByTestId("cie-id-not-installed-open-store");
      fireEvent.press(openStore);

      expect(mockOpenUrl).toHaveBeenCalledWith(
        CIE_ID_ANDROID_COLL_LINK,
        anyFunction
      );
      expect(mockPopToTop).not.toHaveBeenCalled();
    });
  });
  UAT_ENV_ENABLE_STATES.forEach(uatState => {
    it("Should call popToTop", () => {
      const { getByTestId } = render(
        <CieIdNotInstalledWithStore isUat={uatState} />
      );

      const popToTop = getByTestId("cie-id-not-installed-pop-to-top");
      fireEvent.press(popToTop);

      expect(mockOpenUrl).not.toHaveBeenCalled();
      expect(mockPopToTop).toHaveBeenCalledTimes(1);
    });
  });
});
