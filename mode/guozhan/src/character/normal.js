import { Character } from "../../../../noname/library/element/index.js";

export default {
	gz_caocao: new Character({
		sex: "male",
		group: "wei",
		hp: 4,
		maxHp: 4,
		hujia: 0,
		skills: ["gz_jianxiong"],
	}),
	gz_simayi: new Character({
		sex: "male",
		group: "wei",
		hp: 3,
		maxHp: 3,
		hujia: 0,
		skills: ["guicai", "fankui"],
	}),
	gz_xiahoudun: new Character({
		sex: "male",
		group: "wei",
		hp: 4,
		maxHp: 4,
		hujia: 0,
		skills: ["gz_ganglie"],
	}),
	gz_zhangliao: new Character({
		sex: "male",
		group: "wei",
		hp: 4,
		maxHp: 4,
		hujia: 0,
		skills: ["gz_tuxi"],
	}),
	gz_xuzhu: new Character({
		sex: "male",
		group: "wei",
		hp: 4,
		maxHp: 4,
		hujia: 0,
		skills: ["gz_luoyi"],
	}),
	gz_guojia: new Character({
		sex: "male",
		group: "wei",
		hp: 3,
		maxHp: 3,
		hujia: 0,
		skills: ["tiandu", "gz_yiji"],
		hasSkinInGuozhan: true,
	}),
};
