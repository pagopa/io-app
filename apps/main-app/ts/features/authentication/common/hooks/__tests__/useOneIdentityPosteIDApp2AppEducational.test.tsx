import { render } from "@testing-library/react-native";

import { SpidIdp } from "../../../../../utils/idps";
import { useOneIdentityPosteIDApp2AppEducational } from "../useOneIdentityPosteIDApp2AppEducational";

const mockPresent = jest.fn();

jest.mock("../../../../../utils/hooks/bottomSheet", () => ({
  useIOBottomSheetModal: jest.fn(() => ({
    present: mockPresent,
    bottomSheet: <></>
  }))
}));

const posteIdp = { id: "https://posteid.poste.it" } as SpidIdp;
const otherIdp = { id: "arubaid" } as SpidIdp;

type HookProps = Parameters<typeof useOneIdentityPosteIDApp2AppEducational>[0];

const WrapperComponent = (props: HookProps) => {
  const bottomSheet = useOneIdentityPosteIDApp2AppEducational(props);
  return <>{bottomSheet}</>;
};

describe("useOneIdentityPosteIDApp2AppEducational", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should present the bottom sheet when idp is posteid and the WebView is loaded", () => {
    render(<WrapperComponent idp={posteIdp} isWebViewLoaded={true} />);

    expect(mockPresent).toHaveBeenCalledTimes(1);
  });

  test.each([
    {
      name: "idp is posteid but the WebView is not loaded",
      idp: posteIdp,
      isWebViewLoaded: false
    },
    {
      name: "idp is not posteid and the WebView is loaded",
      idp: otherIdp,
      isWebViewLoaded: true
    },
    {
      name: "idp is not posteid and the WebView is not loaded",
      idp: otherIdp,
      isWebViewLoaded: false
    }
  ])(
    "should not present the bottom sheet when $name",
    ({ idp, isWebViewLoaded }) => {
      render(<WrapperComponent idp={idp} isWebViewLoaded={isWebViewLoaded} />);

      expect(mockPresent).not.toHaveBeenCalled();
    }
  );

  it("should present the bottom sheet once the WebView becomes loaded", () => {
    const { rerender } = render(
      <WrapperComponent idp={posteIdp} isWebViewLoaded={false} />
    );
    expect(mockPresent).not.toHaveBeenCalled();

    rerender(<WrapperComponent idp={posteIdp} isWebViewLoaded={true} />);

    expect(mockPresent).toHaveBeenCalledTimes(1);
  });

  it("should present the bottom sheet only once across re-renders", () => {
    const { rerender } = render(
      <WrapperComponent idp={posteIdp} isWebViewLoaded={true} />
    );

    rerender(<WrapperComponent idp={posteIdp} isWebViewLoaded={false} />);
    rerender(<WrapperComponent idp={posteIdp} isWebViewLoaded={true} />);

    expect(mockPresent).toHaveBeenCalledTimes(1);
  });
});
