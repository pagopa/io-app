import { Divider } from "@pagopa/io-app-design-system";
import { render } from "@testing-library/react-native";
import type { ComponentProps } from "react";
import { FimsClaimsList } from "../FimsClaims";

jest.mock("@pagopa/io-app-design-system", () => ({
  ...jest.requireActual("@pagopa/io-app-design-system"),
  Divider: jest.fn(() => <></>)
}));

describe("FimsClaims component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly with an empty claims list and does not render Divider", () => {
    const { toJSON } = renderComponent({ claims: [] });
    expect(toJSON()).toMatchSnapshot();
    expect(Divider).toHaveBeenCalledTimes(0);
  });

  it("renders correctly with a single claim and does not render Divider", () => {
    const { toJSON } = renderComponent({
      claims: [
        {
          name: "email",
          display_name: "E-Mail address"
        }
      ]
    });
    expect(toJSON()).toMatchSnapshot();
    expect(Divider).toHaveBeenCalledTimes(0);
  });

  [
    {
      claims: [
        {
          name: "email",
          display_name: "E-Mail address"
        },
        {
          name: "name",
          display_name: "Full name"
        }
      ],
      dividers: 1
    },
    {
      claims: [
        {
          name: "email",
          display_name: "E-Mail address"
        },
        {
          name: "name",
          display_name: "Full name"
        },
        {
          name: "fiscal_code",
          display_name: "Fiscal Code"
        }
      ],
      dividers: 2
    }
  ].forEach(({ claims, dividers }) =>
    it(`renders correctly with ${claims.length} claims and renders ${dividers} Dividers`, () => {
      const { toJSON } = renderComponent({
        claims
      });
      expect(toJSON()).toMatchSnapshot();
      expect(Divider).toHaveBeenCalledTimes(dividers);
    })
  );
});

const renderComponent = (props: ComponentProps<typeof FimsClaimsList>) =>
  render(<FimsClaimsList {...props} />);
