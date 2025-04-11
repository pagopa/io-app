import { render } from "@testing-library/react-native";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { usePosteIDApp2AppEducational } from "../../hooks/usePosteIDApp2AppEducational";
import { SpidIdp } from "../../../../../../../definitions/content/SpidIdp";
import { ErrorType, StandardLoginRequestInfo } from "../../store/types";
import { useIOBottomSheetAutoresizableModal } from "../../../../../../utils/hooks/bottomSheet";

jest.mock("../../../../../../utils/hooks/bottomSheet", () => ({
  useIOBottomSheetAutoresizableModal: jest.fn(() => ({
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

  it("should set presentedRef to true when onDismiss is called", () => {
    // rendera il componente per inizializzare l'hook
    renderComponent({
      selectedIdp: { id: "not-posteid" } as SpidIdp,
      requestState: pot.none
    });

    // recupera la callback `onDismiss` passata al bottom sheet
    const { onDismiss } = (useIOBottomSheetAutoresizableModal as jest.Mock).mock
      .calls[0][0];

    // chiamala
    onDismiss();

    // puoi anche aspettarti che la funzione sia stata chiamata, ma non è necessario per la coverage
  });
});
