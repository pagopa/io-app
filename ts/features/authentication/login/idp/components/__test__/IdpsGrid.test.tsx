import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import IdpsGrid from "../../components/IdpsGrid";
import { SpidIdp } from "../../../../../../utils/idps";

describe("IdpsGrid", () => {
  const mockIdps: Array<SpidIdp> = [
    {
      id: "idp1",
      logo: { light: { uri: "https://example.com/logo1.png" } },
      name: "IDP One",
      profileUrl: "https://example.com/logo1.png"
    },
    {
      id: "idp2",
      logo: { light: { uri: "https://example.com/logo2.png" } },
      name: "IDP Two",
      profileUrl: "https://example.com/logo2.png"
    }
  ];

  const onIdpSelected = jest.fn();

  const renderComponent = (
    props?: Partial<React.ComponentProps<typeof IdpsGrid>>
  ) =>
    render(
      <IdpsGrid
        idps={mockIdps}
        onIdpSelected={onIdpSelected}
        testID="idps-grid"
        {...props}
      />
    );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly with provided IDPs", () => {
    const { getByTestId } = renderComponent();

    expect(getByTestId("idps-grid")).toBeTruthy();
    expect(getByTestId("idp-idp1-button")).toBeTruthy();
    expect(getByTestId("idp-idp2-button")).toBeTruthy();
  });

  it("calls onIdpSelected when an IDP is pressed", () => {
    const { getByTestId } = renderComponent();

    fireEvent.press(getByTestId("idp-idp1-button"));
    expect(onIdpSelected).toHaveBeenCalledWith(mockIdps[0]);

    fireEvent.press(getByTestId("idp-idp2-button"));
    expect(onIdpSelected).toHaveBeenCalledWith(mockIdps[1]);
  });

  it("renders optional header and footer components", () => {
    const Header = () => <></>;
    const Footer = () => <></>;

    const { getByTestId } = renderComponent({
      headerComponent: <Header />,
      footerComponent: <Footer />
    });

    expect(getByTestId("idps-grid")).toBeTruthy();
  });

  it("renders with empty IDPs list", () => {
    const { queryByTestId } = renderComponent({ idps: [] });

    expect(queryByTestId("idps-grid")).toBeTruthy();
    expect(queryByTestId("idp-idp1-button")).toBeNull();
  });
});
