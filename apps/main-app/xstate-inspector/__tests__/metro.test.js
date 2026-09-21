/**
 * `withXStateInspector` is the only Metro integration the app should need:
 * it must mount the inspector, remap the two inspect internals, and leave
 * every other Metro option and hook intact.
 */
const fs = require("fs");
const { withXStateInspector } = require("../metro");

/** @type {import("http").ServerResponse} */
const mockResponse = () => {
  const res = {
    writeHead: jest.fn().mockReturnThis(),
    end: jest.fn()
  };
  return /** @type {never} */ (res);
};

describe("withXStateInspector", () => {
  it("preserves unrelated Metro options", () => {
    const config = withXStateInspector({
      projectRoot: "/app",
      transformer: { babelTransformerPath: "x" },
      resolver: { sourceExts: ["js"] }
    });

    expect(config.projectRoot).toBe("/app");
    expect(config.transformer.babelTransformerPath).toBe("x");
    expect(config.resolver.sourceExts).toEqual(["js"]);
  });

  it("stubs partysocket as an empty module", () => {
    const config = withXStateInspector({ resolver: {} });

    expect(
      config.resolver.resolveRequest(
        /** @type {never} */ ({}),
        "partysocket",
        "ios"
      )
    ).toEqual({ type: "empty" });
  });

  it("points #uuid at the browser build of @statelyai/inspect", () => {
    const config = withXStateInspector({ resolver: {} });
    const result = config.resolver.resolveRequest(
      /** @type {never} */ ({}),
      "#uuid",
      "ios"
    );

    expect(result).toEqual({
      type: "sourceFile",
      filePath: expect.stringMatching(/uuid-browser\.mjs$/)
    });
    expect(fs.existsSync(result.filePath)).toBe(true);
  });

  it("defers other modules to the previous resolver", () => {
    const previous = jest.fn(() => ({
      type: "sourceFile",
      filePath: "/app.js"
    }));
    const config = withXStateInspector({
      resolver: { resolveRequest: previous }
    });
    const context = /** @type {never} */ ({});

    expect(config.resolver.resolveRequest(context, "crypto", "ios")).toEqual({
      type: "sourceFile",
      filePath: "/app.js"
    });
    expect(previous).toHaveBeenCalledWith(context, "crypto", "ios");
  });

  it("falls through to Metro's default resolver when none is configured", () => {
    const defaultResolve = jest.fn(() => ({ type: "empty" }));
    const config = withXStateInspector({ resolver: {} });

    config.resolver.resolveRequest(
      /** @type {never} */ ({ resolveRequest: defaultResolve }),
      "lodash",
      "ios"
    );

    expect(defaultResolve).toHaveBeenCalledWith(
      expect.objectContaining({ resolveRequest: defaultResolve }),
      "lodash",
      "ios"
    );
  });

  it("answers inspector routes and leaves Metro routes to Metro", () => {
    const metroMiddleware = jest.fn();
    const config = withXStateInspector({});
    const wrapped = config.server.enhanceMiddleware(metroMiddleware);

    const healthRes = mockResponse();
    wrapped(
      /** @type {never} */ ({
        url: "/xstate-inspector/health",
        method: "GET"
      }),
      healthRes,
      jest.fn()
    );
    expect(healthRes.writeHead).toHaveBeenCalledWith(200, expect.any(Object));
    expect(metroMiddleware).not.toHaveBeenCalled();

    wrapped(
      /** @type {never} */ ({ url: "/status" }),
      mockResponse(),
      jest.fn()
    );
    expect(metroMiddleware).toHaveBeenCalled();
  });

  it("composes with an existing enhanceMiddleware", () => {
    const inner = jest.fn();
    const previous = jest.fn(() => inner);
    const metroMiddleware = jest.fn();
    const metroServer = { tag: "server" };
    const config = withXStateInspector({
      server: { enhanceMiddleware: previous }
    });

    const wrapped = config.server.enhanceMiddleware(
      metroMiddleware,
      metroServer
    );
    expect(previous).toHaveBeenCalledWith(metroMiddleware, metroServer);

    wrapped(
      /** @type {never} */ ({ url: "/status" }),
      mockResponse(),
      jest.fn()
    );
    expect(inner).toHaveBeenCalled();
    expect(metroMiddleware).not.toHaveBeenCalled();
  });
});
