import js from "@eslint/js";
import ts from "typescript-eslint";
import vue from "eslint-plugin-vue";
import globals from "globals";

export default ts.config(js.configs.recommended, ts.configs.recommended, vue.configs["flat/essential"], {
	ignores: ["node_modules/", "noname-server.js", "tsconfig.json", "game/codemirror.js", "game/jszip.js", "game/pressure.js", "game/compiler-sfc.esm-browser.js", "game/core-js-bundle.js", "game/dedent.js", "game/typescript.js", "game/vue.esm-browser.js", "game/NoSleep.js"],
	files: ["**/*.js", "**/*.mjs", "**/*.ts", "**/*.vue"],
	rules: {
		"no-class-assign": 0,
		"no-console": 0,
		"no-constant-condition": [
			"error",
			{
				checkLoops: false,
			},
		],
		"no-irregular-whitespace": [
			"error",
			{
				skipStrings: true,
				skipTemplates: true,
			},
		],
		"no-redeclare": 0,
		"no-undef": 0,
		"no-unused-vars": 0,
		"require-yield": 0,
		"no-fallthrough": ["error", { commentPattern: "\\[falls[\\s\\w]*through\\]" }],
		curly: "error",
	},
	languageOptions: {
		ecmaVersion: 13,
		sourceType: "module",
		globals: {
			...globals.browser,
			...globals.es2015,
			...globals.node,
			...globals.serviceworker,
			...globals.worker,
		},
	},
});
