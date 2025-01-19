import { render } from "@testing-library/react-native";
import { ItwStoredCredentialsMocks } from "../../../utils/itwMocksUtils";
import { CardData } from "../CardData";

describe("CardData", () => {
  it("should match snapshot for MDL front data", () => {
    const component = render(
      <CardData credential={ItwStoredCredentialsMocks.mdl} side="front" />
    );

    expect(component.queryByTestId("mdlFrontDataTestID")).toBeTruthy();
    expect(component).toMatchSnapshot();
  });

  it("should match snapshot for MDL back data", () => {
    const component = render(
      <CardData credential={ItwStoredCredentialsMocks.mdl} side="back" />
    );

    expect(component.queryByTestId("mdlBackDataTestID")).toBeTruthy();
    expect(component).toMatchSnapshot();
  });

  it("should match snapshot for DC front data", () => {
    const component = render(
      <CardData credential={ItwStoredCredentialsMocks.dc} side="front" />
    );

    expect(component.queryByTestId("dcFrontDataTestID")).toBeTruthy();
    expect(component).toMatchSnapshot();
  });

  it("should match snapshot for DC back data", () => {
    const component = render(
      <CardData credential={ItwStoredCredentialsMocks.dc} side="back" />
    );

    expect(component.queryByTestId("dcBackDataTestID")).toBeTruthy();
    expect(component).toMatchSnapshot();
  });
});
