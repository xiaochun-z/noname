import { GameGuozhan } from "./game.js";

export const gamePatch = _generateExtraFuncions(GameGuozhan.prototype);

/**
 * 一个非常申必的生成额外函数的函数
 * 
 * @param {any} prototype 
 * @returns {object}
 */
function _generateExtraFuncions(prototype) {
	const result = {};
	const names = Object.getOwnPropertyNames(prototype);

	if (names[0] === "constructor") {
		names.shift();
	} else if (names[names.length - 1] === "constructor") {
		names.pop();
	} else {
		names.remove("constructor");
	}

	for (const name of names) {
		result[name] = prototype[name];
	}

	return result;
}
