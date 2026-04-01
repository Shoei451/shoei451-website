// scripts/build-minify.mjs
import { globSync } from "glob";
import { execSync } from "node:child_process";

const js = globSync("dist/**/*.js", {
  ignore: ["dist/node_modules/**"],
  absolute: true,
});

const css = globSync("dist/**/*.css", {
  ignore: ["dist/node_modules/**"],
  absolute: true,
});

if (js.length) {
  execSync(
    `node_modules/.bin/esbuild ${js.join(" ")} --minify --allow-overwrite --outdir=dist`,
    { stdio: "inherit" },
  );
}

if (css.length) {
  execSync(
    `node_modules/.bin/esbuild ${css.join(" ")} --minify --allow-overwrite`,
    { stdio: "inherit" },
  );
}
