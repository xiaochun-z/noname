// 具体功能参考 https://developer.mozilla.org/zh-CN/docs/Web/HTML/Reference/Elements/script/type/importmap
if (typeof HTMLScriptElement.supports === "function" && HTMLScriptElement.supports("importmap")) {
	const importMap = {
		imports: {
			vue: "./game/vue.esm-browser.js",
			typescript: "./game/typescript.js",
			"@vue/devtools-api": "./game/empty-devtools-api.js",
			"@/": "./",
			"@vue/": "./node_modules/@types/noname-typings/@vue/",
		},
		scopes: {},
	};
	if (typeof window.require == "function" && typeof window.process == "object" && typeof window.__dirname == "string") {
		// 使importMap解析node内置模块
		const builtinModules = require("module").builtinModules;
		if (Array.isArray(builtinModules)) {
			for (const module of builtinModules) {
				importMap.imports[module] = importMap.imports[`node:${module}`] = `./noname-builtinModules/${module}`;
			}
		}
	}
	const im = document.createElement("script");
	im.type = "importmap";
	im.textContent = JSON.stringify(importMap, null, 2);
	// @ts-ignore
	document.currentScript.after(im);
}
