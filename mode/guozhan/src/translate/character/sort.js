import { sort as normalSort } from "./normal.js";
import { sort as zhenSort } from "./zhen.js";

const sortList = [normalSort, zhenSort];
const sortMap = sortList.reduce((result, [id, translate]) => {
	result[id] = translate;
	return result;
}, {});

export default sortMap;
