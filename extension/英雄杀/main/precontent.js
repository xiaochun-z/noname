import { lib, game, ui, get, ai, _status } from "../../../noname.js";

export function precontent(config, pack) {
	Promise.all([import("../character/index.js")])
		.then(() => {
			lib.translate.yxs_character_config = "英雄杀";
		})
		.catch(err => {
			console.error("Failed to import extension 『英雄杀』: ", err);
			alert("Error:『英雄杀』扩展导入失败");
		});
}
