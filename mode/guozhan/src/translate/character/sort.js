import { sort as normalSort } from "./normal.js";
import { sort as zhenSort } from "./zhen.js";
import { sort as shiSort } from "./shi.js";
import { sort as bianSort } from "./bian.js";

const sortList = [normalSort, zhenSort, shiSort, bianSort];
const sortMap = sortList.reduce((result, [id, translate]) => {
	result[id] = translate;
	return result;
}, {});

export default sortMap;
