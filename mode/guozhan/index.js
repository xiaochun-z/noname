import { lib, game, ui, get, ai, _status } from "../../noname.js";
import { start, startBefore, onreinit } from "./src/main.js";

export const type = "mode";

/**
 * @type {importModeConfig}
 */
export default {
	name: "guozhan",

	start,
	startBefore,
	onreinit
};
