import { lib, game, ui, get, ai, _status } from "../../../noname.js";

export function precontent(config, pack) {
	Promise.all([import("../card/index.js")])
		.then(() => {
			lib.config.all.cards.push("欢乐卡牌");
			lib.translate.欢乐卡牌_card_config = "欢乐卡牌";
		})
		.catch(err => {
			console.error("Failed to import extension 『欢乐卡牌』: ", err);
			alert("Error:『欢乐卡牌』扩展导入失败");
		});
}
