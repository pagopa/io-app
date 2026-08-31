import { render } from "@testing-library/react-native";
import { type Metrics, SafeAreaProvider } from "react-native-safe-area-context";

import { FooterActions } from "../FooterActions";

const onPress = () => undefined;

/* `FooterActions` reads the safe area insets to compute its bottom margins,
   so every case has to be rendered inside a provider with fixed metrics. */
const metrics: Metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 }
};

const renderFooterActions = (
  actions: React.ComponentProps<typeof FooterActions>["actions"]
) =>
  render(
    <SafeAreaProvider initialMetrics={metrics}>
      <FooterActions actions={actions} />
    </SafeAreaProvider>
  );

const cases = [
  {
    name: "SingleButton",
    actions: {
      primary: { label: "Primary", onPress },
      type: "SingleButton"
    }
  },
  {
    name: "TwoButtons",
    actions: {
      primary: { label: "Primary", onPress },
      secondary: { label: "Secondary", onPress },
      type: "TwoButtons"
    }
  },
  {
    name: "ThreeButtons",
    actions: {
      primary: { label: "Primary", onPress },
      secondary: { label: "Secondary", onPress },
      tertiary: { label: "Tertiary", onPress },
      type: "ThreeButtons"
    }
  }
] as const;

describe("FooterActions - Snapshot", () => {
  it.each(cases)("$name", ({ actions }) => {
    const { toJSON } = renderFooterActions(actions);
    expect(toJSON()).toMatchSnapshot();
  });
});

describe("FooterActions - rendered actions", () => {
  it.each(cases)("$name renders every provided label", ({ actions }) => {
    const { getByLabelText } = renderFooterActions(actions);
    expect(getByLabelText("Primary")).toBeTruthy();
    if ("secondary" in actions) {
      expect(getByLabelText(actions.secondary.label)).toBeTruthy();
    }
    if ("tertiary" in actions) {
      expect(getByLabelText(actions.tertiary.label)).toBeTruthy();
    }
  });

  it("renders nothing when no actions are provided", () => {
    const { queryByLabelText } = renderFooterActions(undefined);
    expect(queryByLabelText("Primary")).toBeNull();
  });
});

/* Rendering is decided by two independent rules, and both are only enforced at
   runtime for untyped callers, since the `actions` union already rules these
   shapes out at compile time:
     1. `type` selects which slots are eligible at all;
     2. each eligible slot renders only if its action object is present. */
const asActions = (actions: unknown) =>
  actions as React.ComponentProps<typeof FooterActions>["actions"];

describe("FooterActions - rendering rules", () => {
  it("skips an eligible slot whose action object is missing", () => {
    const { getAllByRole, queryByLabelText } = renderFooterActions(
      asActions({
        primary: { label: "Primary", onPress },
        secondary: { label: "Secondary", onPress },
        type: "ThreeButtons"
      })
    );

    expect(queryByLabelText("Primary")).toBeTruthy();
    expect(queryByLabelText("Secondary")).toBeTruthy();
    /* The absent tertiary must not mount a wrapper plus a label-less button,
       so assert on the button count rather than on the missing label */
    expect(getAllByRole("button")).toHaveLength(2);
  });

  it("ignores action objects the type does not make eligible", () => {
    const { getAllByRole, queryByLabelText } = renderFooterActions(
      asActions({
        primary: { label: "Primary", onPress },
        secondary: { label: "Secondary", onPress },
        tertiary: { label: "Tertiary", onPress },
        type: "SingleButton"
      })
    );

    expect(queryByLabelText("Primary")).toBeTruthy();
    expect(getAllByRole("button")).toHaveLength(1);
  });
});
