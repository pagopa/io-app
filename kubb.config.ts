import { UserConfig, defineConfig } from "@kubb/core";
import { pluginOas } from "@kubb/plugin-oas";
import { pluginReactQuery } from "@kubb/plugin-react-query";
import { pluginTs } from "@kubb/plugin-ts";
import { pluginZod } from "@kubb/plugin-zod";
import packageJson from "./package.json";

function singleFileApiDefinition({
  scope,
  schema,
  baseURL
}: {
  scope: string;
  schema: string;
  baseURL: string;
}): UserConfig {
  return {
    input: {
      path: schema
    },
    output: {
      path: `./fetch-sdk/${scope}`
    },
    plugins: [
      pluginOas({}),
      pluginTs({
        unknownType: "unknown",
        transformers: {
          name(name) {
            return `${capitalize(scope)}${name}`;
          }
        }
      }),
      pluginZod({
        typed: true,
        inferred: true,
        transformers: {
          name(name) {
            return `${capitalize(scope)}${capitalize(name)}`;
          }
        }
      }),
      pluginReactQuery({
        parser: "zod",
        query: {
          methods: ["get", "post", "put", "delete"]
        },
        mutation: {
          methods: []
        },
        suspense: false,
        // pathParamsType: "object",
        // paramsType: "object",
        client: {
          importPath: "../../../ts/fetch-client.ts",
          baseURL,
          dataReturnType: "data"
        },
        transformers: {
          name(name, type) {
            if (name.startsWith("use")) {
              return `use${capitalize(scope)}${name.slice(3)}`;
            }
            if (type === "file" || type === "function") {
              return `${scope}${capitalize(name)}`;
            }
            return `${capitalize(scope)}${capitalize(name)}`;
          }
        }
      })
    ]
  };
}

export default defineConfig([
  singleFileApiDefinition({
    scope: "cgn",
    schema: (packageJson as any).io_cgn_specs,
    baseURL: "/api/v1/cgn"
  }),
  singleFileApiDefinition({
    scope: "cgnMerchants",
    schema: (packageJson as any).io_cgn_merchants_specs,
    baseURL: "/api/v1/cgn/operator-search"
  })
  // TODO: list all definitions to generate
]);

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
