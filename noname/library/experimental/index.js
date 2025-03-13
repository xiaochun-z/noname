import { lib } from "../index.js";
import { Uninstantable } from "../../util/index.js";

import * as ExperimentalSymbol from "./symbol.js";

export class Experimental {
	symbol = ExperimentalSymbol;
	symbols = ExperimentalSymbol;

	/**
	 * @type {boolean}
	 */
	get enable() {
		return Reflect.get(lib.config, "experimental_enable");
	}
}

export let experimental = new Experimental();

/**
 * @param {Experimental} instance 
 */
export function setExperimental(instance) {
	experimental = instance || new Experimental();
	if (lib.config.dev) {
		Reflect.set(window, "experimental", experimental);
	}
};
