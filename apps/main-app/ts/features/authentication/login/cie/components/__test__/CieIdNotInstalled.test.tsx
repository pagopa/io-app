import { fireEvent, render } from "@testing-library/react-native";
import { Platform } from "react-native";

import { withStore } from "../../../../../../utils/jest/withStore";
import * as urlUtils from "../../../../../../utils/url";
import { CIE_ENVS } from "../../utils";
import CieIdNotInstalled, {
  CIE_ID_ANDROID_LINK,
  CIE_ID_IOS_LINK
} from "../CieIdNotInstalled";

const CIE_ENV_STATES = Object.values(CIE_ENVS);

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

describe("CieIdNotInstalled", () => {
  afterEach(jest.clearAllMocks);

  it("Should match the snapshot", () => {
    const component = render(
      <CieIdNotInstalledWithStore cieEnv="production" />
    );

    expect(component).toMatchSnapshot();
  });

  describe("Behavior on iOS", () => {
    CIE_ENV_STATES.forEach(cieEnv => {
      it("Should open CIE_ID_IOS_LINK", async () => {
        const { getByTestId } = render(
          <CieIdNotInstalledWithStore cieEnv={cieEnv} />
        );

        const openStore = getByTestId("cie-id-not-installed-open-store");
        fireEvent.press(openStore);

        expect(mockOpenUrl).toHaveBeenCalledWith(CIE_ID_IOS_LINK, anyFunction);
        expect(mockPopToTop).not.toHaveBeenCalled();
      });
    });
  });

  describe("Behavior on Android", () => {
    beforeEach(() => {
      jest
        .spyOn(Platform, "select")
        .mockImplementation((spec: Record<string, unknown>) => spec.android);
    });
    afterEach(() => {
      jest.mocked(Platform.select).mockRestore();
    });

    it.each([
      ["production", CIE_ID_ANDROID_LINK],
      ["preprod", `${CIE_ID_ANDROID_LINK}.coll`]
    ] as const)("Should open the Android store link for %s", (cieEnv, url) => {
      const { getByTestId } = render(
        <CieIdNotInstalledWithStore cieEnv={cieEnv} />
      );

      const openStore = getByTestId("cie-id-not-installed-open-store");
      fireEvent.press(openStore);

      expect(mockOpenUrl).toHaveBeenCalledWith(url, anyFunction);
      expect(mockPopToTop).not.toHaveBeenCalled();
    });
  });

  CIE_ENV_STATES.forEach(cieEnv => {
    it("Should call popToTop", () => {
      const { getByTestId } = render(
        <CieIdNotInstalledWithStore cieEnv={cieEnv} />
      );

      const popToTop = getByTestId("cie-id-not-installed-pop-to-top");
      fireEvent.press(popToTop);

      expect(mockOpenUrl).not.toHaveBeenCalled();
      expect(mockPopToTop).toHaveBeenCalledTimes(1);
    });
  });
});
