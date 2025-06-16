import { lib, game, ui, get, ai, _status } from "../../noname.js";

const cards = {
	xuanhuafu: {
		fullskin: true,
		derivation: "std_zhengcong",
		cardcolor: "diamond",
		type: "equip",
		subtype: "equip1",
		distance: { attackFrom: -2 },
		skills: ["xuanhuafu_skill"],
		ai: {
			basic: {
				equipValue: 4.5,
				order: (card, player) => {
					const equipValue = get.equipValue(card, player) / 20;
					return player && player.hasSkillTag("reverseEquip") ? 8.5 - equipValue : 8 + equipValue;
				},
				useful: 2,
				value: (card, player, index, method) => {
					if (!player.getCards("e").includes(card) && !player.canEquip(card, true)) {
						return 0.01;
					}
					const info = get.info(card),
						current = player.getEquip(info.subtype),
						value = current && card != current && get.value(current, player);
					let equipValue = info.ai.equipValue || info.ai.basic.equipValue;
					if (typeof equipValue == "function") {
						if (method == "raw") {
							return equipValue(card, player);
						}
						if (method == "raw2") {
							return equipValue(card, player) - value;
						}
						return Math.max(0.1, equipValue(card, player) - value);
					}
					if (typeof equipValue != "number") {
						equipValue = 0;
					}
					if (method == "raw") {
						return equipValue;
					}
					if (method == "raw2") {
						return equipValue - value;
					}
					return Math.max(0.1, equipValue - value);
				},
			},
			result: {
				target: (player, target, card) => get.equipResult(player, target, card),
			},
		},
		enable: true,
		selectTarget: -1,
		filterTarget: (card, player, target) => player == target && target.canEquip(card, true),
		modTarget: true,
		allowMultiple: false,
		content: function () {
			if (
				!card?.cards.some(card => {
					return get.position(card, true) !== "o";
				})
			) {
				target.equip(card);
			}
			//if (cards.length && get.position(cards[0], true) == "o") target.equip(cards[0]);
		},
		toself: true,
	},
	baipishuangbi: {
		fullskin: true,
		derivation: "std_jiangjie",
		cardcolor: "spade",
		type: "equip",
		subtype: "equip1",
		skills: ["baipishuangbi_skill"],
		ai: {
			basic: {
				equipValue: 4.5,
				order: (card, player) => {
					const equipValue = get.equipValue(card, player) / 20;
					return player && player.hasSkillTag("reverseEquip") ? 8.5 - equipValue : 8 + equipValue;
				},
				useful: 2,
				value: (card, player, index, method) => {
					if (!player.getCards("e").includes(card) && !player.canEquip(card, true)) {
						return 0.01;
					}
					const info = get.info(card),
						current = player.getEquip(info.subtype),
						value = current && card != current && get.value(current, player);
					let equipValue = info.ai.equipValue || info.ai.basic.equipValue;
					if (typeof equipValue == "function") {
						if (method == "raw") {
							return equipValue(card, player);
						}
						if (method == "raw2") {
							return equipValue(card, player) - value;
						}
						return Math.max(0.1, equipValue(card, player) - value);
					}
					if (typeof equipValue != "number") {
						equipValue = 0;
					}
					if (method == "raw") {
						return equipValue;
					}
					if (method == "raw2") {
						return equipValue - value;
					}
					return Math.max(0.1, equipValue - value);
				},
			},
			result: {
				target: (player, target, card) => get.equipResult(player, target, card),
			},
		},
		enable: true,
		selectTarget: -1,
		filterTarget: (card, player, target) => player == target && target.canEquip(card, true),
		modTarget: true,
		allowMultiple: false,
		content: function () {
			if (
				!card?.cards.some(card => {
					return get.position(card, true) !== "o";
				})
			) {
				target.equip(card);
			}
			//if (cards.length && get.position(cards[0], true) == "o") target.equip(cards[0]);
		},
		toself: true,
	},
};
export default cards;
