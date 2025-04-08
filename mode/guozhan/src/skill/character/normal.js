import { lib, game, ui, get, ai, _status } from "../../../../../noname.js";

export default Object.freeze({
	gz_jianxiong: {
		audio: "jianxiong",
		trigger: { player: "damageEnd" },
		async cost(event, trigger, player) {
			let list = ["摸牌"];
			if (get.itemtype(trigger.cards) == "cards" && trigger.cards.filterInD().length) {
				list.push("拿牌");
			}
			list.push("cancel2");
			const {
				result: { control },
			} = await player
				.chooseControl(list)
				.set("prompt", get.prompt2("rejianxiong_old"))
				.set("ai", () => {
					const player = get.event("player"),
						trigger = get.event().getTrigger();
					const cards = trigger.cards ? trigger.cards.filterInD() : [];
					// @ts-expect-error 类型就是这么写的
					if (get.event().controls.includes("拿牌")) {
						if (
							cards.reduce((sum, card) => {
								return sum + (card.name == "du" ? -1 : 1);
							}, 0) > 1 ||
							player.getUseValue(cards[0]) > 6
						)
							return "拿牌";
					}
					return "摸牌";
				});
			event.result = { bool: control != "cancel2", cost_data: control };
		},
		async content(event, trigger, player) {
			if (event.cost_data == "摸牌") await player.draw();
			else await player.gain(trigger.cards.filterInD(), "gain2");
		},
		ai: {
			maixie: true,
			maixie_hp: true,
			effect: {
				target(card, player, target) {
					if (player.hasSkillTag("jueqing", false, target)) return [1, -1];
					if (get.tag(card, "damage") && player != target) return [1, 0.6];
				},
			},
		},
	},
});
