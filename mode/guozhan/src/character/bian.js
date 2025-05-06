import { Character } from "../../../../noname/library/element/index.js";

export default {
	gz_liqueguosi: new Character({
		sex: "male",
		group: "qun",
		hp: 4,
		maxHp: 4,
		hujia: 0,
		skills: ["gzxiongsuan"],
		hasSkinInGuozhan: true,
	}),
	gz_zuoci: new Character({
		sex: "male",
		group: "qun",
		hp: 3,
		maxHp: 3,
		hujia: 0,
		skills: ["fakeyigui", "fakejihun"],
		hasSkinInGuozhan: true,
	}),
	gz_bianfuren: new Character({
		sex: "female",
		group: "wei",
		hp: 3,
		maxHp: 3,
		hujia: 0,
		skills: ["wanwei", "gzyuejian"],
		dieAudios: ["ol_bianfuren"],
	}),
	gz_xunyou: new Character({
		sex: "male",
		group: "wei",
		hp: 3,
		maxHp: 3,
		hujia: 0,
		skills: ["gzqice", "zhiyu"],
		hasSkinInGuozhan: true,
	}),
	gz_lingtong: new Character({
		sex: "male",
		group: "wu",
		hp: 4,
		maxHp: 4,
		hujia: 0,
		skills: ["xuanlve", "yongjin"],
		hasSkinInGuozhan: true,
	}),
	gz_lvfan: new Character({
		sex: "male",
		group: "wu",
		hp: 3,
		maxHp: 3,
		hujia: 0,
		skills: ["gzdiaodu_backports", "gzdiancai"],
		hasSkinInGuozhan: true,
	}),
	gz_masu: new Character({
		sex: "male",
		group: "shu",
		hp: 3,
		maxHp: 3,
		hujia: 0,
		skills: ["gzsanyao", "gzzhiman"],
		hasSkinInGuozhan: true,
	}),
	gz_shamoke: new Character({
		sex: "male",
		group: "shu",
		hp: 4,
		maxHp: 4,
		hujia: 0,
		skills: ["gzjili"],
		hasSkinInGuozhan: true,
	}),
};

export const intro = {};

export const sort = "guozhan_bian";
