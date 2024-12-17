import { render } from "@testing-library/react-native";
import { IdPayCard } from "../IdPayCard";

describe("IdPayCard", () => {
  it("should match the snapshot", () => {
    const component = render(
      <IdPayCard
        name="18 app"
        amount={9999}
        avatarSource={{
          uri: "https://vtlogo.com/wp-content/uploads/2021/08/18app-vector-logo.png"
        }}
        expireDate={new Date(2023, 11, 2)}
      />
    );
    expect(component).toMatchSnapshot();
  });
});
