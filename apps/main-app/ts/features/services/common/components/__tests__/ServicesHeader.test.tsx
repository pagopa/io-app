import { render } from "@testing-library/react-native";

import { ServicesHeader } from "../ServicesHeader";

describe("ServicesHeader component", () => {
  it("should match the snapshot", () => {
    const component = render(
      <ServicesHeader
        logoUri={require("../../../../../../img/test/logo.png")}
        subTitle={"#### subTitle ####"}
        title={"#### title ####"}
      />
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
});
