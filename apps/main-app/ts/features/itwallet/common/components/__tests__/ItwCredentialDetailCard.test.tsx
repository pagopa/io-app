import { fireEvent, render } from "@testing-library/react-native";
import { Platform } from "react-native";
import { Provider } from "react-redux";
import { createStore } from "redux";

import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { CredentialType } from "../../utils/itwMocksUtils";
import { ItwCredentialDetailCard } from "../ItwCredentialDetailCard";

jest.mock("react-native-safe-area-context", () => ({
  ...jest.requireActual("react-native-safe-area-context"),
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 })
}));

const renderCard = (credentialType: string) => {
  const store = createStore(
    appReducer,
    appReducer(undefined, applicationChangeState("active")) as any
  );
  return render(
    <Provider store={store}>
      <ItwCredentialDetailCard credentialType={credentialType} />
    </Provider>
  );
};

const layoutEvent = {
  nativeEvent: { layout: { x: 0, y: 0, width: 380, height: 420 } }
};

describe("ItwCredentialDetailCard", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should draw the header artwork with native views", () => {
    const { queryByTestId } = renderCard(CredentialType.DRIVING_LICENSE);

    expect(
      queryByTestId("itwCredentialDetailCardBackgroundTestID")
    ).not.toBeNull();
    expect(
      queryByTestId("itwCredentialDetailCardArtworkTestID")
    ).not.toBeNull();
  });

  it("should mount the border canvas only once the card size is known", () => {
    const { getByTestId, queryByTestId } = renderCard(
      CredentialType.DRIVING_LICENSE
    );

    expect(queryByTestId("itwCredentialDetailCardCanvasTestID")).toBeNull();

    fireEvent(
      getByTestId("itwCredentialDetailCardTestID"),
      "layout",
      layoutEvent
    );

    expect(queryByTestId("itwCredentialDetailCardCanvasTestID")).not.toBeNull();
  });

  test.each([
    { name: "on iOS", os: "ios" as const, version: "18.0", native: true },
    {
      name: "on Android 10",
      os: "android" as const,
      version: 29,
      native: true
    },
    { name: "on Android 9", os: "android" as const, version: 28, native: false }
  ])(
    "should draw the pattern natively only where the blend is supported: $name",
    ({ os, version, native }) => {
      jest.replaceProperty(Platform, "OS", os);
      jest.spyOn(Platform, "Version", "get").mockReturnValue(version);

      const { queryByTestId } = renderCard(CredentialType.EDUCATION_DEGREE);

      expect(queryByTestId("itwCredentialCardPatternTestID") !== null).toBe(
        native
      );
      expect(
        queryByTestId("itwCredentialDetailCardBackgroundTestID") !== null
      ).toBe(native);
    }
  );
});
