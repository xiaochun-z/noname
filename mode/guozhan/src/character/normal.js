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
	gz_zhenji: new Character({
		sex: "female",
		group: "wei",
		hp: 3,
		maxHp: 3,
		hujia: 0,
		skills: ["luoshen", "qingguo"],
		hasSkinInGuozhan: true,
	}),
	gz_xiahouyuan: new Character({
		sex: "male",
		group: "wei",
		hp: 4,
		maxHp: 4,
		hujia: 0,
		skills: ["gz_shensu"],
		hasSkinInGuozhan: true,
	}),
};

export const intro = {
	gz_xiahouyuan: "字妙才，沛国谯人。东汉末年曹操部下名将，夏侯惇之族弟，八虎骑之一。群雄征讨董卓时随曹操一同起兵，后征战四方，屡立功勋。在平定马超叛乱后负责西北防线的镇守。公元219年刘备攻打汉中，被刘备部将黄忠所杀。"
}
