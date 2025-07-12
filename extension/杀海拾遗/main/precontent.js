import { lib, game, ui, get, ai, _status } from "./utils.js";

export function precontent(config, pack) {
	Promise.all([
		import("../card/gujian/index.js"),
		import("../card/gwent/index.js"),
		import("../card/hearth/index.js"),
		import("../card/mtg/index.js"),
		import("../card/swd/index.js"),
		import("../card/yunchou/index.js"),
		import("../card/zhenfa/index.js"),
		import("../character/gujian/index.js"),
		import("../character/gwent/index.js"),
		import("../character/hearth/index.js"),
		import("../character/mtg/index.js"),
		import("../character/ow/index.js"),
		import("../character/swd/index.js"),
		import("../character/xianjian/index.js"),
		import("../character/yunchou/index.js"),
	])
		.then(() => {
			lib.translate.gujian_character_config = "古剑奇谭";
			lib.translate.gujian_card_config = "古剑奇谭";
			lib.translate.gwent_character_config = "昆特牌";
			lib.translate.gwent_card_config = "昆特牌";
			lib.translate.hearth_character_config = "炉石传说";
			lib.translate.hearth_card_config = "炉石传说";
			lib.translate.mtg_character_config = "万智牌";
			lib.translate.mtg_card_config = "万智牌";
			lib.translate.ow_character_config = "守望先锋";
			lib.translate.swd_character_config = "轩辕剑";
			lib.translate.swd_card_config = "轩辕剑";
			lib.translate.xianjian_character_config = "仙剑奇侠传";
			lib.translate.yunchou_card_config = "运筹帷幄";
			lib.translate.yunchou_character_config = "运筹帷幄";
			lib.translate.zhenfa_card_config = "阵法";
		})
		.catch(err => {
			console.error("Failed to import extension 『杀海拾遗』: ", err);
			alert("Error:『杀海拾遗』扩展导入失败");
		});
}
