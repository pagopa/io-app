import * as pot from "@pagopa/ts-commons/lib/pot";
import { render } from "@testing-library/react-native";
import { SpidIdp } from "../../../../../../utils/idps";
import { usePosteIDApp2AppEducational } from "../../hooks/usePosteIDApp2AppEducational";
import { ErrorType, StandardLoginRequestInfo } from "../../store/types";

jest.mock("../../../../../../utils/hooks/bottomSheet", () => ({
  useIOBottomSheetModal: jest.fn(() => ({
    present: mockPresent,
    bottomSheet: <></>
  }))
}));

const mockPresent = jest.fn();

const renderComponent = (props: {
  selectedIdp?: SpidIdp;
  requestState: StandardLoginRequestInfo["requestState"];
}) => {
  const WrapperComponent = () => {
    const bottomSheet = usePosteIDApp2AppEducational(props);
    return <>{bottomSheet}</>;
  };
  return render(<WrapperComponent />);
};

describe("usePosteIDApp2AppEducational", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should show bottom sheet only if idp is posteid and request is successful", () => {
    renderComponent({
      selectedIdp: { id: "posteid" } as SpidIdp,
      requestState: pot.some(true)
    });

    expect(mockPresent).toHaveBeenCalledTimes(1);
  });

  it("should not show bottom sheet if selectedIdp is undefined", () => {
    renderComponent({
      selectedIdp: undefined,
      requestState: pot.some(true)
    });

    expect(mockPresent).not.toHaveBeenCalled();
  });

  it("should not show bottom sheet if requestState is loading", () => {
    renderComponent({
      selectedIdp: { id: "posteid" } as SpidIdp,
      requestState: pot.someLoading(true)
    });

    expect(mockPresent).not.toHaveBeenCalled();
  });

  it("should not show bottom sheet if requestState is error", () => {
    renderComponent({
      selectedIdp: { id: "posteid" } as SpidIdp,
      requestState: pot.toError(pot.some(true), ErrorType.LOADING_ERROR)
    });

    expect(mockPresent).not.toHaveBeenCalled();
  });
});
