import { lib, game, ui, get, ai, _status } from "../../../noname.js";

export function precontent(config, pack) {
	Promise.all([import("../character/index.js")])
		.then(() => {
			lib.translate.ddd_character_config = "3D精选";
		})
		.catch(err => {
			console.error("Failed to import extension 『3D精选』: ", err);
			alert("Error:『3D精选』扩展导入失败");
		});
}
