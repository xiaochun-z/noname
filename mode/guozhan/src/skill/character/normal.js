import { lib, game, ui, get, ai, _status } from "../../../../../noname.js";
import { GameEvent, Player } from "../../../../../noname/library/element/index.js";
import { PlayerGuozhan } from "../../patch/player.js";

export default {
	// gz_caocao
	gz_jianxiong: {
		audio: "jianxiong",
		trigger: {
			player: "damageEnd",
		},
		/**
		 * @param {GameEvent} event
		 * @param {GameEvent} trigger
		 * @param {PlayerGuozhan} player
		 */
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
			event.result = { bool: control != "cancel2", cost_data: { result: control } };
		},
		/**
		 * @param {GameEvent} event
		 * @param {GameEvent} trigger
		 * @param {PlayerGuozhan} player
		 */
		async content(event, trigger, player) {
			if (event.cost_data.result == "摸牌") {
				await player.draw();
			} else {
				await player.gain(trigger.cards.filterInD(), "gain2");
			}
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

	// gz_xiahoudun
	gz_ganglie: {
		audio: "ganglie", // TODO: 改成独立的配音
		trigger: {
			player: "damageEnd",
		},
		/**
		 * @param {GameEvent} event
		 * @param {PlayerGuozhan} _player
		 * @returns {boolean}
		 */
		filter(event, _player) {
			return event.source != undefined && event.num > 0;
		},
		/**
		 * @param {GameEvent} event
		 * @param {PlayerGuozhan} player
		 * @returns {boolean}
		 */
		check(event, player) {
			return get.attitude(player, event.source) <= 0;
		},
		logTarget: "source",
		preHidden: true,
		/**
		 * @param {GameEvent} event
		 * @param {GameEvent} trigger
		 * @param {PlayerGuozhan} player
		 */
		async content(event, trigger, player) {
			const result = await player.judge(card => (get.color(card) == "red" ? 1 : 0)).forResult();

			switch (result.color) {
				case "black":
					if (trigger.source.countCards("he")) {
						player.discardPlayerCard(trigger.source, "he", true);
					}
					break;

				case "red":
					if (trigger.source.isIn()) {
						trigger.source.damage();
					}
					break;
				default:
					break;
			}
		},
		ai: {
			maixie_defend: true,
			expose: 0.4,
		},
	},

	// gz_zhangliao
	gz_tuxi: {
		audio: "tuxi", // TODO: 改成独立的配音
		audioname2: {
			gz_jun_caocao: "jianan_tuxi",
		},
		trigger: {
			player: "phaseDrawBegin2",
		},
		preHidden: true,
		/**
		 * @param {GameEvent} event
		 * @param {PlayerGuozhan | Player} player
		 * @returns {boolean}
		 */
		filter(event, player) {
			// @ts-expect-error 类型就是这么写的
			return event.num > 0 && !event.numFixed && game.hasPlayer(target => target.countCards("h") > 0 && player != target);
		},
		/**
		 * @param {GameEvent} event
		 * @param {GameEvent} trigger
		 * @param {PlayerGuozhan} player
		 */
		async cost(event, trigger, player) {
			const num = Math.min(trigger.num, 2);

			const next = player.chooseTarget(
				get.prompt("gz_tuxi"),
				`获得至多${get.translation(num)}名角色的各一张手牌，然后少摸等量的牌`,
				[1, num],
				(_card, player, target) => target.countCards("h") > 0 && player != target,
				target => {
					const att = get.attitude(_status.event?.player, target);
					if (target.hasSkill("tuntian")) {
						return att / 10;
					}
					return 1 - att;
				}
			);
			next.setHiddenSkill("gz_tuxi");

			event.result = await next.forResult();
		},
		logTarget: "targets",
		/**
		 * @param {GameEvent} event
		 * @param {GameEvent} trigger
		 * @param {PlayerGuozhan} player
		 */
		async content(event, trigger, player) {
			const { targets } = event;
			targets.sortBySeat();
			await player.gainMultiple(targets);
			trigger.num -= targets.length;
			if (trigger.num <= 0) {
				await game.delay();
			}
		},
		ai: {
			threaten: 1.6,
			expose: 0.2,
		},
	},
};
