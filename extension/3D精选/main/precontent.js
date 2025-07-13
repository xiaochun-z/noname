import { lib, game, ui, get, ai, _status } from "../../../noname.js";

export async function precontent(config, pack) {
	// 适用于链式、强依赖、异步阻塞场景
	try {
		await import("../character/index.js");
		lib.translate.ddd_character_config = "3D精选";
	} catch (err) {
		console.error("Failed to import extension 『3D精选』: ", err);
		alert("Error:『3D精选』扩展导入失败");
	}
}
