import * as pot from "@pagopa/ts-commons/lib/pot";
import { render } from "@testing-library/react-native";
import React from "react";
import { RemoteSwitch } from "../RemoteSwitch";

describe("RemoteSwitch tests", () => {
  jest.useFakeTimers();
  it("Snapshot for pot.none", () => {
    const component = render(<RemoteSwitch value={pot.none} />);
    expect(component).toMatchSnapshot();
  });
  it("Snapshot for pot.noneLoading", () => {
    const component = render(<RemoteSwitch value={pot.noneLoading} />);
    expect(component).toMatchSnapshot();
  });
  it("Snapshot for pot.noneUpdating", () => {
    const component = render(<RemoteSwitch value={pot.noneUpdating(true)} />);
    expect(component).toMatchSnapshot();
  });
  it("Snapshot for pot.noneError", () => {
    const component = render(
      <RemoteSwitch value={pot.noneError(new Error())} />
    );
    expect(component).toMatchSnapshot();
  });
  it("Snapshot for pot.some", () => {
    const someTrue = render(<RemoteSwitch value={pot.some(true)} />);
    expect(someTrue).toMatchSnapshot();
    const someFalse = render(<RemoteSwitch value={pot.some(false)} />);
    expect(someFalse).toMatchSnapshot();
  });

  it("Snapshot for pot.someLoading", () => {
    const someLoadingTrue = render(
      <RemoteSwitch value={pot.someLoading(true)} />
    );
    expect(someLoadingTrue).toMatchSnapshot();
    const someLoadingFalse = render(
      <RemoteSwitch value={pot.someLoading(false)} />
    );
    expect(someLoadingFalse).toMatchSnapshot();
  });
  it("Snapshot for pot.someUpdating", () => {
    const someUpdatingFalseTrue = render(
      <RemoteSwitch value={pot.someUpdating(false, true)} />
    );
    expect(someUpdatingFalseTrue).toMatchSnapshot();
    const someUpdatingTrueFalse = render(
      <RemoteSwitch value={pot.someUpdating(true, false)} />
    );
    expect(someUpdatingTrueFalse).toMatchSnapshot();
  });
  it("Snapshot for pot.someError", () => {
    const someErrorTrue = render(
      <RemoteSwitch value={pot.someError(true, new Error())} />
    );
    expect(someErrorTrue).toMatchSnapshot();
    const someErrorFalse = render(
      <RemoteSwitch value={pot.someError(false, new Error())} />
    );
    expect(someErrorFalse).toMatchSnapshot();
  });
});
