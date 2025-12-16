import { render } from "@testing-library/react-native";

import { useOnFirstRender } from "../useOnFirstRender";

const TestContainer = ({
  cbk,
  shouldRun
}: {
  cbk: () => void;
  shouldRun: boolean;
}) => {
  useOnFirstRender(cbk, () => shouldRun);
  return null;
};

describe("the `useReloadIfNeeded` hook ", () => {
  describe("with default parameters", () => {
    it("should call the callback only on the first render", () => {
      // eslint-disable-next-line functional/no-let
      let cbk = jest.fn();
      const component = render(<TestContainer cbk={cbk} shouldRun={true} />);
      expect(cbk).toHaveBeenCalledTimes(1);
      cbk = jest.fn();
      component.update(<TestContainer cbk={cbk} shouldRun={true} />);
      expect(cbk).not.toHaveBeenCalled();
    });
  });

  describe("when `shouldRun` returns false", () => {
    it("should never call the callback", () => {
      // eslint-disable-next-line functional/no-let
      let cbk = jest.fn();
      const component = render(<TestContainer cbk={cbk} shouldRun={false} />);
      expect(cbk).not.toHaveBeenCalled();
      cbk = jest.fn();
      component.update(<TestContainer cbk={cbk} shouldRun={false} />);
      expect(cbk).not.toHaveBeenCalled();
    });
  });
});
