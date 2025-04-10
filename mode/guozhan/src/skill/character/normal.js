import { lib, game, ui, get, ai, _status } from "../../../../../noname.js";
import { GameEvent, Player, Card } from "../../../../../noname/library/element/index.js";
import { cast } from "../../../../../noname/util/index.js";
import { PlayerGuozhan } from "../../patch/player.js";
import { broadcastAll } from "../../patch/game.js";

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

	// gz_xuzhu
	gz_luoyi: {
		audio: "luoyi",
		trigger: {
			player: "phaseDrawEnd",
		},
		preHidden: true,
		/**
		 * @param {GameEvent} _event
		 * @param {PlayerGuozhan} player
		 * @returns {boolean}
		 */
		filter(_event, player) {
			return player.countCards("he") > 0;
		},
		/**
		 * @param {GameEvent} event
		 * @param {GameEvent} _trigger
		 * @param {PlayerGuozhan} player
		 */
		async cost(event, _trigger, player) {
			const next = player.chooseToDiscard("he", get.prompt2("gz_luoyi"));

			next.setHiddenSkill("gz_luoyi");
			next.set("ai", check);

			event.result = await next.forResult();

			return;

			/**
			 * @param {Card} card
			 * @returns {number}
			 */
			function check(card) {
				const player = get.player();

				if (player.hasCard(cardx => cardx != card && (cardx.name == "sha" || cardx.name == "juedou") && player.hasValueTarget(cardx, undefined, true), "hs")) {
					return 5 - get.value(card);
				}

				return -get.value(card);
			}
		},
		/**
		 * @param {GameEvent} _event
		 * @param {GameEvent} _trigger
		 * @param {PlayerGuozhan} player
		 */
		async content(_event, _trigger, player) {
			player.addTempSkill("gz_luoyi_buff");
		},
		subSkill: {
			buff: {
				audio: "luoyi",
				charlotte: true,
				forced: true,
				trigger: {
					source: "damageBegin1",
				},
				/**
				 * @param {GameEvent} event
				 * @param {PlayerGuozhan} _player
				 * @returns {boolean}
				 */
				filter(event, _player) {
					const parent = event.getParent();
					if (parent == null || !("type" in parent)) {
						return false;
					}
					return event.card && (event.card.name == "sha" || event.card.name == "juedou") && parent.type == "card";
				},
				/**
				 * @param {GameEvent} _event
				 * @param {GameEvent} trigger
				 * @param {PlayerGuozhan} _player
				 */
				async content(_event, trigger, _player) {
					trigger.num++;
				},
			},
		},
	},

	// gz_guojia
	gz_yiji: {
		audio: "yiji",
		trigger: {
			player: "damageEnd",
		},
		frequent: true,
		preHidden: true,

		/**
		 * @param {GameEvent} event
		 * @param {GameEvent} trigger
		 * @param {PlayerGuozhan} player
		 */
		async content(event, trigger, player) {
			const cards = game.cardsGotoOrdering(get.cards(2)).cards;
			/** @type {Map<string, Card[]>} */
			const givenMap = new Map();

			if (_status.connectMode) {
				broadcastAll(() => {
					Reflect.set(_status, "noclearcountdown", true);
				});
			}

			while (cards.length > 0) {
				/** @type {Partial<Result>} */
				let result;

				if (cards.length > 1) {
					result = await player
						.chooseCardButton("遗计：请选择要分配的牌", true, cards, [1, cards.length])
						.set("ai", () => {
							if (ui.selected.buttons.length == 0) return 1;
							return 0;
						})
						.forResult();
				} else {
					result = { bool: true, links: cards.slice(0) };
				}

				if (!result.bool) {
					break;
				}

				/** @type {Card[]} */
				const links = cast(result.links);
				cards.removeArray(links);
				const toGive = links.slice(0);

				result = await player
					.chooseTarget("选择一名角色获得" + get.translation(result.links), true)
					.set("ai", (/** @type {PlayerGuozhan} */ target) => {
						/** @type {GameEvent & { enemy: boolean }} */
						const event = cast(get.event());
						var att = get.attitude(event.player, target);
						if (event.enemy) {
							return -att;
						} else if (att > 0) {
							return att / (1 + target.countCards("h"));
						} else {
							return att / 100;
						}
					})
					.set("enemy", get.value(toGive[0], player, "raw") < 0)
					.forResult();

				if (!result.bool) {
					break;
				}

				/** @type {PlayerGuozhan[]} */
				const targets = cast(result.targets);
				if (targets.length) {
					const id = targets[0].playerid ?? "";

					if (!givenMap.has(id)) {
						givenMap.set(id, []);
					}
					const current = givenMap.get(id);
					current?.addArray(toGive);
				}
			}

			if (_status.connectMode) {
				broadcastAll(() => {
					Reflect.deleteProperty(_status, "noclearcountdown");
					game.stopCountChoose();
				});
			}

			const list = [];
			for (const [id, cards] of givenMap) {
				const source = (_status.connectMode ? lib.playerOL : game.playerMap)[id];
				player.line(source, "green");
				list.push([source, cards]);
			}
			await game
				.loseAsync({
					gain_list: list,
					giver: player,
					animate: "draw",
				})
				.setContent("gaincardMultiple");
		},
		ai: {
			maixie: true,
			maixie_hp: true,
			effect: {
				target(card, player, target) {
					if (get.tag(card, "damage")) {
						if (player.hasSkillTag("jueqing", false, target)) {
							return [1, -2];
						}
						if (!target.hasFriend()) {
							return;
						}

						let num = 1;
						if (get.attitude(player, target) > 0) {
							if (player.needsToDiscard()) {
								num = 0.7;
							} else {
								num = 0.5;
							}
						}

						if (target.hp >= 4) {
							return [1, num * 2];
						}
						if (target.hp == 3) {
							return [1, num * 1.5];
						}
						if (target.hp == 2) {
							return [1, num * 0.5];
						}
					}
				},
			},
		},
	},

	// gz_xiahouyuan
	gz_shensu: {
		audio: "shensu1", // TODO: 独立素材，留给后来人
		audioname: ["xiahouba", "re_xiahouyuan", "ol_xiahouyuan"],
		group: ["gz_shensu_1", "gz_shensu_2"],
		preHidden: ["gz_hensu_1", "gz_shensu_2", "gz_shensu"],
		trigger: {
			player: "phaseDiscardBegin",
		},
		/**
		 * @param {GameEvent} _event
		 * @param {PlayerGuozhan} player
		 * @returns {boolean}
		 */
		filter(_event, player) {
			return player.hp > 0;
		},
		/**
		 * @param {GameEvent} event
		 * @param {GameEvent} _trigger
		 * @param {PlayerGuozhan} player
		 */
		async cost(event, _trigger, player) {
			event.result = await player
				.chooseTarget(get.prompt("gz_shensu"), "失去1点体力并跳过弃牌阶段，视为对一名其他角色使用一张无距离限制的【杀】", (card, player, target) => player.canUse("sha", target, false))
				.setHiddenSkill("gz_shensu")
				.set("goon", player.needsToDiscard())
				.set("ai", target => {
					/** @type {GameEvent & { goon: number }} */
					const event = cast(get.event());
					const player = get.player();
					if (!event.goon || player.hp <= target.hp) return false;
					return get.effect(target, { name: "sha", isCard: true }, player, player);
				})
				.forResult();
		},
		logTarget: "targets",
		/**
		 * @param {GameEvent} event
		 * @param {GameEvent} trigger
		 * @param {PlayerGuozhan} player
		 */
		async content(event, trigger, player) {
			const { targets } = event;
			const target = targets[0];
			await player.loseHp();
			trigger.cancel();
			await player.useCard({ name: "sha", isCard: true }, target, false);
		},
		subSkill: {
			// TODO: 后面或许将不存在shensu1，所以后来人需要重新填写技能信息
			1: {
				audio: "shensu1",
				inherit: "shensu1",
				sourceSkill: "gz_shensu",
			},
			2: {
				inherit: "shensu2",
				sourceSkill: "gz_shensu",
			},
		},
	},

	// gz_zhanghe
	gz_qiaobian: {
		audio: "qiaobian", // TODO: 你说得对，未来得拆，未来可期
		audioname2: { gz_jun_caocao: "jianan_qiaobian" },
		trigger: {
			player: ["phaseJudgeBefore", "phaseDrawBefore", "phaseUseBefore", "phaseDiscardBefore"],
		},
		/**
		 * @param {GameEvent} _event
		 * @param {PlayerGuozhan} player
		 * @returns {boolean}
		 */
		filter(_event, player) {
			return player.countCards("h") > 0;
		},
		preHidden: true,
		/**
		 * @param {GameEvent} event
		 * @param {GameEvent} trigger
		 * @param {PlayerGuozhan} player
		 */
		async cost(event, trigger, player) {
			let check;
			let str = "弃置一张手牌并跳过";
			str += ["判定", "摸牌", "出牌", "弃牌"][lib.skill.qiaobian?.trigger?.player?.indexOf(event.triggername) ?? 0];
			str += "阶段";
			if (trigger.name == "phaseDraw") str += "，然后可以获得至多两名角色各一张手牌";
			if (trigger.name == "phaseUse") str += "，然后可以移动场上的一张牌";
			switch (trigger.name) {
				case "phaseJudge":
					check = player.countCards("j");
					break;
				case "phaseDraw": {
					let i;
					let num = 0;
					let num2 = 0;
					const players = game.filterPlayer(lib.filter.all);
					for (i = 0; i < players.length; i++) {
						// @ts-ignore
						if (player != players[i] && players[i].countCards("h")) {
							const att = get.attitude(player, players[i]);
							if (att <= 0) {
								num++;
							}
							if (att < 0) {
								num2++;
							}
						}
					}
					check = num >= 2 && num2 > 0;
					break;
				}
				case "phaseUse":
					if (!player.canMoveCard(true)) {
						check = false;
					} else {
						check = game.hasPlayer(current => {
							return get.attitude(player, current) > 0 && current.countCards("j") > 0;
						});
						if (!check) {
							if (player.countCards("h") > player.hp + 1) {
								check = false;
							} else if (player.countCards("h", { name: "wuzhong" })) {
								check = false;
							} else {
								check = true;
							}
						}
					}
					break;
				case "phaseDiscard":
					check = player.needsToDiscard();
					break;
			}
			event.result = await player
				.chooseToDiscard(get.prompt("qiaobian"), str, lib.filter.cardDiscardable)
				.set("ai", card => {
					/** @type {GameEvent & {check: any}} */
					const event = cast(get.event());
					if (!event.check) return -1;
					return 7 - get.value(card);
				})
				.set("check", check)
				.setHiddenSkill("qiaobian")
				.forResult();
		},
		/**
		 * @param {GameEvent} event
		 * @param {GameEvent} trigger
		 * @param {PlayerGuozhan} player
		 */
		async content(event, trigger, player) {
			trigger.cancel();
			game.log(player, "跳过了", "#y" + ["判定", "摸牌", "出牌", "弃牌"][lib.skill.qiaobian?.trigger?.player?.indexOf(event.triggername) ?? 0] + "阶段");
			if (trigger.name == "phaseUse") {
				if (player.canMoveCard()) await player.moveCard();
			} else if (trigger.name == "phaseDraw") {
				const { result } = await player
					.chooseTarget([1, 2], "获得至多两名角色各一张手牌", function (card, player, target) {
						return target != player && target.countCards("h");
					})
					.set("ai", target => {
						return 1 - get.attitude(get.player(), target);
					});
				if (!result.bool) return;
				result.targets?.sortBySeat();
				player.line(result.targets, "green");
				if (!result.targets?.length) return;
				// @ts-ignore
				await player.gainMultiple(result.targets);
				await game.delay();
			}
		},
		ai: {
			threaten: 3,
		},
	},

	// gz_xuhuang
	gz_duanliang: {
		locked: false,
		audio: "duanliang1", // 未来可期未来改
		audioname2: {
			gz_jun_caocao: "jianan_duanliang",
		},
		enable: "chooseToUse",
		/**
		 * @param {Card} card
		 * @returns {boolean}
		 */
		filterCard(card) {
			if (get.type(card) != "basic" && get.type(card) != "equip") return false;
			return get.color(card) == "black";
		},
		/**
		 * @param {GameEvent} _event
		 * @param {PlayerGuozhan} player
		 * @returns {boolean}
		 */
		filter(_event, player) {
			if (player.hasSkill("gz_duanliang_off")) return false;
			return player.countCards("hes", { type: ["basic", "equip"], color: "black" }) > 0;
		},
		position: "hes",
		viewAs: {
			name: "bingliang",
		},
		onuse(result, player) {
			if (get.distance(player, result.targets[0]) > 2) player.addTempSkill("gz_duanliang_off");
		},
		prompt: "将一黑色的基本牌或装备牌当兵粮寸断使用",
		check(card) {
			return 6 - get.value(card);
		},
		mod: {
			targetInRange(card, player, target) {
				if (card.name == "bingliang") {
					return true;
				}
			},
		},
		ai: {
			order: 9,
			basic: {
				order: 1,
				useful: 1,
				value: 4,
			},
			result: {
				target(player, target) {
					if (target.hasJudge("caomu")) return 0;
					return -1.5 / Math.sqrt(target.countCards("h") + 1);
				},
			},
			tag: {
				skip: "phaseDraw",
			},
		},
		subSkill: {
			off: {
				sub: true,
			},
		},
	},

	// gz_caoren
	gz_jushou: {
		audio: "xinjushou", // 你懂我要说什么.png
		trigger: {
			player: "phaseJieshuBegin",
		},
		preHidden: true,
		/**
		 * @param {GameEvent} event
		 * @param {GameEvent} trigger
		 * @param {PlayerGuozhan} player
		 */
		async content(event, trigger, player) {
			"step 0";
			const groups = [];
			const players = game.filterPlayer(lib.filter.all);

			for (var target of players) {
				if (target.isUnseen(-1)) continue;
				let add = true;
				for (const group of groups) {
					if (group.isFriendOf(target)) {
						add = false;
						break;
					}
				}
				if (add) groups.add(target);
			}
			const num = groups.length;
			await player.draw(num);
			if (num > 2) {
				await player.turnOver();
			}

			const result = await player
				.chooseCard("h", true, "弃置一张手牌，若以此法弃置的是装备牌，则你改为使用之")
				.set("ai", (/** @type {Card} */ card) => {
					if (get.type(card) == "equip") {
						return 5 - get.value(card);
					}
					return -get.value(card);
				})
				.set("filterCard", lib.filter.cardDiscardable)
				.forResult();

			if (result.bool && result.cards?.length) {
				if (get.type(result.cards[0]) == "equip" && player.hasUseTarget(result.cards[0])) {
					player.chooseUseTarget(result.cards[0], true, "nopopup");
				} else {
					player.discard(result.cards[0]);
				}
			}
		},
	},

	// gz_dianwei
	/** @type {Skill} */
	gz_qiangxi: {
		audio: "qiangxi", // 已经，没有什么好怕的了（
		enable: "phaseUse",
		filterCard(card) {
			return get.subtype(card) == "equip1";
		},
		selectCard() {
			return [0, 1];
		},
		filterTarget(_card, player, target) {
			if (player == target) return false;
			if (target.hasSkill("reqiangxi_off")) return false;
			return player.inRange(target);
		},
		async content(event, _trigger, player) {
			const { cards, target } = event;

			if (cards.length == 0) {
				await player.loseHp();
			}

			target.addTempSkill("gz_qiangxi_off", "phaseUseAfter");
			await target.damage("nocard");
		},
		/**
		 * @param {Card} card
		 * @returns {number}
		 */
		check(card) {
			return 10 - get.value(card);
		},
		position: "he",
		ai: {
			order: 8.5,
			threaten: 1.5,
			result: {
				target(player, target) {
					if (!ui.selected.cards.length) {
						if (player.hp < 2) return 0;
						if (target.hp >= player.hp) return 0;
					}
					return get.damageEffect(target, player);
				},
			},
		},
		subSkill: {
			off: {
				sub: true,
			},
		},
	},

	// gz_xunyu
	/** @type {Skill} */
	gz_quhu: {
		audio: "quhu",
		audioname: ["re_xunyu", "ol_xunyu"],
		enable: "phaseUse",
		usable: 1,
		filter(_event, player) {
			if (player.countCards("h") == 0) return false;
			return game.hasPlayer(current => current.hp > player.hp && player.canCompare(current));
		},
		filterTarget(_card, player, target) {
			return target.hp > player.hp && player.canCompare(target);
		},
		async content(event, _trigger, player) {
			const target = event.target;
			const bool = await player.chooseToCompare(target, void 0).forResultBool();
			if (!bool) return void (await player.damage(target));
			if (!game.hasPlayer(player => player != target && target.inRange(player))) return;
			const { result } = await player
				.chooseTarget((card, player, target) => {
					const source = _status.event?.source;
					return target != source && source?.inRange(target);
				}, true)
				.set("ai", target => get.damageEffect(target, _status.event?.source, player))
				.set("source", target);
			if (!result.bool || !result.targets || !result.targets.length) return;
			target.line(result.targets[0], "green");
			await result.targets[0].damage(target);
		},
		ai: {
			order: 0.5,
			result: {
				target(player, target) {
					const att = get.attitude(player, target);
					const oc = target.countCards("h") == 1;
					if (att > 0 && oc) return 0;
					const players = game.filterPlayer(lib.filter.all);
					for (let i = 0; i < players.length; i++) {
						if (players[i] != target && players[i] != player && target.inRange(players[i])) {
							if (get.damageEffect(players[i], target, player) > 0) {
								return att > 0 ? att / 2 : att - (oc ? 5 : 0);
							}
						}
					}
					return 0;
				},
				player(player, target) {
					if (target.hasSkillTag("jueqing", false, target)) return -10;
					const hs = player.getCards("h");
					let mn = 1;
					for (let i = 0; i < hs.length; i++) {
						const num = get.number(hs[i]);
						if (typeof num == "number") {
							mn = Math.max(mn, num);
						}
					}
					if (mn <= 11 && player.hp < 2) return -20;
					let max = player.maxHp - hs.length;
					const players = game.filterPlayer(lib.filter.all);
					for (let i = 0; i < players.length; i++) {
						if (get.attitude(player, players[i]) > 2) {
							max = Math.max(Math.min(5, players[i].hp) - players[i].countCards("h"), max);
						}
					}
					switch (max) {
						case 0:
							return mn == 13 ? 0 : -20;
						case 1:
							return mn >= 12 ? 0 : -15;
						case 2:
							return 0;
						case 3:
							return 1;
						default:
							return max;
					}
				},
			},
			expose: 0.2,
		},
	},
	/** @type {Skill} */
	gz_jieming: {
		audio: "jieming",
		trigger: {
			player: "damageEnd",
		},
		preHidden: true,
		async cost(event, _trigger, player) {
			const next = player.chooseTarget(get.prompt("gz_jieming"), "令一名角色将手牌补至X张（X为其体力上限且至多为5）");

			next.set("ai", check);
			next.setHiddenSkill("gz_jieming");

			event.result = await next.forResult();

			/**
			 * @param {PlayerGuozhan} target
			 */
			function check(target) {
				const player = get.player();
				var att = get.attitude(player, target);
				if (att > 2) {
					return Math.max(0, Math.min(5, target.maxHp) - target.countCards("h"));
				}
				return att / 3;
			}
		},
		logTarget: "targets",
		async content(event, _trigger, _player) {
			for (const target of event.targets) {
				const num = Math.min(5, target.maxHp) - target.countCards("h");
				if (num > 0) {
					await target.draw(num);
				}
			}
		},
		ai: {
			maixie: true,
			maixie_hp: true,
			effect: {
				target(card, player, target, current) {
					if (get.tag(card, "damage") && target.hp > 1) {
						if (player.hasSkillTag("jueqing", false, target)) return [1, -2];
						var max = 0;
						var players = game.filterPlayer(lib.filter.all);
						for (var i = 0; i < players.length; i++) {
							if (get.attitude(target, players[i]) > 0) {
								max = Math.max(Math.min(5, players[i].hp) - players[i].countCards("h"), max);
							}
						}
						switch (max) {
							case 0:
								return 2;
							case 1:
								return 1.5;
							case 2:
								return [1, 2];
							default:
								return [0, max];
						}
					}
					if ((card.name == "tao" || card.name == "caoyao") && target.hp > 1 && target.countCards("h") <= target.hp) return [0, 0];
				},
			},
		},
	},
};
