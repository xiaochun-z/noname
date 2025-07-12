import { lib, game, ui, get, ai, _status } from "../../../noname.js";

export function precontent(config, pack) {
	Promise.all([import("../card/index.js"), import("../character/index.js")])
		.then(() => {
			lib.translate.wandian_card_config = "玩点论杀";
			lib.translate.wandian_character_config = "玩点论杀";
		})
		.catch(err => {
			console.error("Failed to import extension 『玩点论杀』: ", err);
			alert("Error:『玩点论杀』扩展导入失败");
		});
}
