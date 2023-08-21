// ex. scripts/build_npm.ts
import { build, emptyDir } from "https://deno.land/x/dnt/mod.ts";

await emptyDir("./npm");

await build({
  entryPoints: ["./mod.ts"],
  outDir: "./npm",
  test: false,
  scriptModule: false,
  shims: {
    // see JS docs for overview and more options
    deno: false,
  },
  package: {
    // package.json properties
    name: "mixwith.ts",
    version: Deno.args[0],
    description: "Typescript compatible fork of Justin Fagnani's Mixin library mixwith.js",
    license: "Apache-2.0",
    repository: {
      type: "git",
      url: "git+https://github.com/justinweinberg/mixwith.ts.git",
    },
    bugs: {
      url: "https://github.com/justinweinberg/mixwith.ts/issues",
    },
  },
  postBuild() {
    // steps to run after building and before running the tests
    Deno.copyFileSync("LICENSE", "npm/LICENSE");
    Deno.copyFileSync("README.md", "npm/README.md");
  },
});