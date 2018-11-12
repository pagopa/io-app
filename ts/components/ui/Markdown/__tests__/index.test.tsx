import * as React from "react";
import * as renderer from "react-test-renderer";

import { Markdown } from "..";

const mokedDispatch = jest.fn();

describe("Markdown", () => {
  describe("heading", () => {
    it("should render heading1 correctly", () => {
      const tree = renderer
        .create(
          <Markdown dispatch={mokedDispatch}># A simple heading1</Markdown>
        )
        .toJSON();

      expect(tree).toMatchSnapshot();
    });

    it("should render heading2 correctly", () => {
      const tree = renderer
        .create(
          <Markdown dispatch={mokedDispatch}>## A simple heading2</Markdown>
        )
        .toJSON();

      expect(tree).toMatchSnapshot();
    });

    it("should render heading3 correctly", () => {
      const tree = renderer
        .create(
          <Markdown dispatch={mokedDispatch}>### A simple heading3</Markdown>
        )
        .toJSON();

      expect(tree).toMatchSnapshot();
    });
  });

  describe("paragraph", () => {
    it("should render paragraph correctly", () => {
      const tree = renderer
        .create(
          <Markdown dispatch={mokedDispatch}>A simple paragraph.</Markdown>
        )
        .toJSON();

      expect(tree).toMatchSnapshot();
    });
  });

  describe("list", () => {
    it("should render unordered list correctly", () => {
      const tree = renderer
        .create(
          <Markdown
            dispatch={mokedDispatch}
          >{`A simple unordered list:\n* Vue\n* React\n* Angular`}</Markdown>
        )
        .toJSON();

      expect(tree).toMatchSnapshot();
    });

    it("should render ordered list correctly", () => {
      const tree = renderer
        .create(
          <Markdown
            dispatch={mokedDispatch}
          >{`A simple ordered list:\n1. Vue\n2. React\n3. Angular`}</Markdown>
        )
        .toJSON();

      expect(tree).toMatchSnapshot();
    });
  });
});
