import { sort as normalSort } from "./normal.js";
import { sort as zhenSort } from "./zhen.js";

export default {
	[normalSort[0]]: normalSort[1],
	[zhenSort[0]]: zhenSort[1],
};
