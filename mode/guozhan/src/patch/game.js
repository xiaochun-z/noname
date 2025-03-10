import { lib, game, ui, get, ai, _status } from "../../../../noname.js";
import { GameEvent, Dialog, Player } from "../../../../noname/library/element/index.js";
import { Game } from "../../../../noname/game/index.js";

export class GameGuozhan extends Game {
	/**
	 * 不确定是干啥的，反正恒返回真
	 *
	 * @returns {boolean}
	 */
	canReplaceViewpoint() {
		return true;
	}

	/**
	 * 当野心家未明置主将，且场上只剩副将所属阵容时，野心家可明置主将，并进行”拉拢人心“
	 *
	 * 详情请参阅规则集
	 *
	 * @returns {GameEvent}
	 */
	showYexings() {
		const next = game.createEvent("showYexings", false);

		// 如果已存在展示野心的野心家，则不做处理
		// @ts-expect-error 祖宗之法就是这么写的
		if (_status.showYexings) {
			next.setContent(async () => {
				return;
			});

			return next;
		}

		// @ts-expect-error 祖宗之法就是这么写的
		_status.showYexings = true;
		next.setContent(showYexingsContent);

		return next;
	}

	/**
	 * 获取武将选择
	 *
	 * @author Spmario233
	 * @param {string[]} list - 所有武将的数组
	 * @param {number} num - 选择武将的数量
	 * @returns {string[]} - 最终武将的数组
	 */
	getCharacterChoice(list, num) {
		const choice = list.splice(0, num).sort(function (a, b) {
			return (get.is.double(a) ? 1 : -1) - (get.is.double(b) ? 1 : -1);
		});
		const map = { wei: [], shu: [], wu: [], qun: [], key: [], jin: [], ye: [] };
		for (let i = 0; i < choice.length; ++i) {
			if (get.is.double(choice[i])) {
				// @ts-expect-error 祖宗之法就是这么写的
				var group = get.is.double(choice[i], true);
				// @ts-expect-error 祖宗之法就是这么写的
				for (var ii of group) {
					if (map[ii] && map[ii].length) {
						map[ii].push(choice[i]);
						lib.character[choice[i]][1] = ii;
						group = false;
						break;
					}
				}
				if (group) choice.splice(i--, 1);
			} else {
				// @ts-expect-error 祖宗之法就是这么写的
				var group = lib.character[choice[i]][1];
				if (map[group]) {
					map[group].push(choice[i]);
				}
			}
		}
		if (map.ye.length) {
			for (const i in map) {
				if (i != "ye" && map[i].length) return choice.randomSort();
			}
			choice.remove(map.ye[0]);
			map.ye.remove(map.ye[0]);
			for (var i = 0; i < list.length; i++) {
				if (lib.character[list[i]][1] != "ye") {
					choice.push(list[i]);
					list.splice(i--, 1);
					return choice.randomSort();
				}
			}
		}
		for (const i in map) {
			if (map[i].length < 2) {
				if (map[i].length == 1) {
					choice.remove(map[i][0]);
					list.push(map[i][0]);
				}
				map[i] = false;
			}
		}
		if (choice.length == num - 1) {
			for (let i = 0; i < list.length; ++i) {
				if (map[lib.character[list[i]][1]]) {
					choice.push(list[i]);
					list.splice(i--, 1);
					break;
				}
			}
		} else if (choice.length < num - 1) {
			let group = null;
			for (let i = 0; i < list.length; ++i) {
				if (group) {
					if (lib.character[list[i]][1] == group || lib.character[list[i]][1] == "ye") {
						choice.push(list[i]);
						list.splice(i--, 1);
						if (choice.length >= num) {
							break;
						}
					}
				} else {
					if (!map[lib.character[list[i]][1]] && !get.is.double(list[i])) {
						group = lib.character[list[i]][1];
						if (group == "ye") group = null;
						choice.push(list[i]);
						list.splice(i--, 1);
						if (choice.length >= num) {
							break;
						}
					}
				}
			}
		}
		return choice.randomSort();
	}

	/**
	 * 联机时获取当前玩家的信息
	 *
	 * @returns {Record<string, { identity: string, shown?: number }>} - 玩家信息的对象
	 */
	getState() {
		/** @type {Record<string, { identity: string, shown?: number }>} */
		const state = {};
		for (const playerId in lib.playerOL) {
			var player = lib.playerOL[playerId];
			state[playerId] = {
				identity: player.identity,
				//group:player.group,
				shown: player.ai.shown,
			};
		}
		return state;
	}

	/**
	 * 联机时更新玩家信息
	 *
	 * @param {Record<string, { identity: string, shown?: number }>} state - 玩家信息的对象
	 */
	updateState(state) {
		for (const playerId in state) {
			const player = lib.playerOL[playerId];
			if (player) {
				player.identity = state[playerId].identity;
				//player.group=state[i].group;
				player.ai.shown = state[playerId].shown;
			}
		}
	}

	/**
	 * 联机时获取当前房间的信息
	 *
	 * @param {Dialog} uiintro
	 */
	getRoomInfo(uiintro) {
		var num, last;
		if (lib.configOL.initshow_draw == "off") {
			num = "关闭";
		} else {
			num = { mark: "标记", draw: "摸牌" }[lib.configOL.initshow_draw];
		}
		uiintro.add('<div class="text chat">群雄割据：' + (lib.configOL.separatism ? "开启" : "关闭"));
		uiintro.add('<div class="text chat">首亮奖励：' + num);
		uiintro.add('<div class="text chat">珠联璧合：' + (lib.configOL.zhulian ? "开启" : "关闭"));
		uiintro.add('<div class="text chat">出牌时限：' + lib.configOL.choose_timeout + "秒");
		uiintro.add('<div class="text chat">国战牌堆：' + (lib.configOL.guozhanpile ? "开启" : "关闭"));
		uiintro.add('<div class="text chat">鏖战模式：' + (lib.configOL.aozhan ? "开启" : "关闭"));
		last = uiintro.add('<div class="text chat">观看下家副将：' + (lib.configOL.viewnext ? "开启" : "关闭"));

		// @ts-expect-error 祖宗之法就是这么写的
		last.style.paddingBottom = "8px";
	}

	/**
	 * 为当前对局增加战绩记录
	 *
	 * @param {Boolean} bool - 当前对局是否胜利
	 */
	async addRecord(bool) {
		if (typeof bool !== "boolean") {
			return;
		}

		const data = lib.config.gameRecord.guozhan.data;

		const identity = game.me.identity;
		if (!data[identity]) {
			data[identity] = [0, 0];
		}

		if (bool) {
			++data[identity][0];
		} else {
			++data[identity][1];
		}

		/// 构建战绩记录字符串
		let group = [...lib.group, "ye"];
		// 过滤神和外服势力，以及没有战绩的势力
		group = group.filter(group => group !== "shen" && group !== "western" && data[group]);
		// 将战绩记录转换为字符串
		const strs = group.map(group => {
			const name = get.translation(`${group[i]}2`);
			const [win, lose] = data[group];

			return `${name}: ${win}胜 ${lose}负`;
		});
		const str = strs.join("<br/>");

		lib.config.gameRecord.guozhan.str = str;

		await game.promises.saveConfig("gameRecord", lib.config.gameRecord);
	}

	/**
	 * 获取某名玩家可能的势力列表
	 *
	 * @param {Player} player - 玩家
	 * @returns {Record<string, string>} - 势力及其对应的名称
	 */
	getIdentityList(player) {
		// @ts-expect-error 祖宗之法就是这么写的
		if (!player.isUnseen()) return;
		// @ts-expect-error 祖宗之法就是这么写的
		if (player === game.me) return;

		let list = {
			wei: "魏",
			shu: "蜀",
			wu: "吴",
			qun: "群",
			ye: "野",
			unknown: "猜",
		};
		const num = Math.floor((game.players.length + game.dead.length) / 2);
		let noye = true;
		if (get.population("wei") >= num) {
			// @ts-expect-error 祖宗之法就是这么写的
			delete list.wei;
			noye = false;
		}
		if (get.population("shu") >= num) {
			// @ts-expect-error 祖宗之法就是这么写的
			delete list.shu;
			noye = false;
		}
		if (get.population("wu") >= num) {
			// @ts-expect-error 祖宗之法就是这么写的
			delete list.wu;
			noye = false;
		}
		if (get.population("qun") >= num) {
			// @ts-expect-error 祖宗之法就是这么写的
			delete list.qun;
			noye = false;
		}
		if (noye) {
			// @ts-expect-error 祖宗之法就是这么写的
			delete list.ye;
		}
		return list;
	}

	/**
	 * @param {string[]} list 
	 */
	getIdentityList2(list) {
		for (var i in list) {
			switch (i) {
				case "unknown":
					list[i] = "未知";
					break;
				case "ye":
					list[i] = "野心家";
					break;
				case "qun":
					list[i] += "雄";
					break;
				case "key":
					list[i] = "Key";
					break;
				case "jin":
					list[i] += "朝";
					break;
				default:
					list[i] += "国";
			}
		}
	}

	getVideoName() {
		var str = get.translation(game.me.name1) + "/" + get.translation(game.me.name2);
		var str2 = _status.separatism
			? get.modetrans({
					mode: lib.config.mode,
					separatism: true,
				})
			: get.cnNumber(parseInt(get.config("player_number"))) + "人" + get.translation(lib.config.mode);
		if (game.me.identity == "ye") {
			str2 += " - 野心家";
		}
		var name = [str, str2];
		return name;
	}
	showIdentity(started) {
		if (game.phaseNumber == 0 && !started) return;
		for (var i = 0; i < game.players.length; i++) {
			game.players[i].showCharacter(2, false);
		}
	}
	tryResult() {
		var map = {},
			sides = [],
			pmap = _status.connectMode ? lib.playerOL : game.playerMap,
			hiddens = [];
		for (var i of game.players) {
			if (i.identity == "unknown") {
				hiddens.push(i);
				continue;
			}
			var added = false;
			for (var j of sides) {
				if (i.isFriendOf(pmap[j])) {
					added = true;
					map[j].push(i);
					break;
				}
			}
			if (!added) {
				map[i.playerid] = [i];
				sides.push(i.playerid);
			}
		}
		if (!sides.length) return;
		else if (sides.length > 1) {
			if (!hiddens.length && sides.length == 2) {
				if (
					map[sides[0]].length == 1 &&
					!map[sides[1]].filter(function (i) {
						return i.identity != "ye" && i.isUnseen(0);
					}).length
				)
					map[sides[0]][0].showGiveup();
				if (
					map[sides[1]].length == 1 &&
					!map[sides[0]].filter(function (i) {
						return i.identity != "ye" && i.isUnseen(0);
					}).length
				)
					map[sides[1]][0].showGiveup();
			}
		} else {
			var isYe = function (player) {
				return player.identity != "ye" && lib.character[player.name1][1] == "ye";
			};
			if (!hiddens.length) {
				if (map[sides[0]].length > 1) {
					for (var i of map[sides[0]]) {
						if (isYe(i)) {
							game.showYexings();
							return;
						}
					}
				}
				game.broadcastAll(function (id) {
					game.winner_id = id;
				}, sides[0]);
				game.checkResult();
			} else {
				var identity = map[sides[0]][0].identity;
				if (identity == "ye") return;
				for (var i of map[sides[0]]) {
					if (isYe(i)) return;
				}
				for (var ind = 0; ind < hiddens.length; ind++) {
					var current = hiddens[ind];
					if (isYe(current) || current.getGuozhanGroup(2) != identity || !current.wontYe(null, ind + 1)) return;
				}
				game.broadcastAll(function (id) {
					game.winner_id = id;
				}, sides[0]);
				game.checkResult();
			}
		}
	}
	checkResult() {
		_status.overing = true;
		var me = game.me._trueMe || game.me;
		for (var i = 0; i < game.players.length; i++) {
			game.players[i].showCharacter(2);
		}
		var winner = (_status.connectMode ? lib.playerOL : game.playerMap)[game.winner_id];
		game.over(winner && winner.isFriendOf(me) ? true : false);
		game.showIdentity();
	}
	checkOnlineResult(player) {
		var winner = lib.playerOL[game.winner_id];
		return winner && winner.isFriendOf(game.me);
	}
	chooseCharacter() {
		var next = game.createEvent("chooseCharacter");
		next.showConfig = true;
		next.addPlayer = true;
		next.ai = function (player, list, back) {
			if (_status.brawl && _status.brawl.chooseCharacterAi) {
				if (_status.brawl.chooseCharacterAi(player, list, back) !== false) {
					return;
				}
			}
			var filterChoice = function (name1, name2) {
				if (_status.separatism) return true;
				var group1 = lib.character[name1][1];
				var group2 = lib.character[name2][1];
				var doublex = get.is.double(name1, true);
				if (doublex) {
					var double = get.is.double(name2, true);
					if (double) return doublex.some(group => double.includes(group));
					return doublex.includes(group2);
				} else {
					if (group1 == "ye") return group2 != "ye";
					var double = get.is.double(name2, true);
					if (double) return double.includes(group1);
					return group1 == group2;
				}
			};
			for (var i = 0; i < list.length - 1; i++) {
				for (var j = i + 1; j < list.length; j++) {
					if (filterChoice(list[i], list[j]) || filterChoice(list[j], list[i])) {
						var mainx = list[i];
						var vicex = list[j];
						if (!filterChoice(mainx, vicex) || (filterChoice(vicex, mainx) && get.guozhanReverse(mainx, vicex))) {
							mainx = list[j];
							vicex = list[i];
						}
						player.init(mainx, vicex, false);
						if (get.is.double(mainx, true)) {
							if (!get.is.double(vicex, true)) player.trueIdentity = lib.character[vicex][1];
							else if (get.is.double(mainx, true).removeArray(get.is.double(vicex, true)).length == 0 || get.is.double(vicex, true).removeArray(get.is.double(mainx, true)).length == 0)
								player.trueIdentity = get.is
									.double(vicex, true)
									.filter(group => get.is.double(mainx, true).includes(group))
									.randomGet();
							else player.trueIdentity = get.is.double(mainx, true).find(group => get.is.double(vicex, true).includes(group));
						} else if (lib.character[mainx][1] == "ye" && get.is.double(vicex, true)) player.trueIdentity = get.is.double(vicex, true).randomGet();
						if (back) {
							list.remove(player.name1);
							list.remove(player.name2);
							for (var i = 0; i < list.length; i++) {
								back.push(list[i]);
							}
						}
						return;
					}
				}
			}
		};
		next.setContent(function () {
			"step 0";
			ui.arena.classList.add("choose-character");
			var addSetting = function (dialog) {
				dialog.add("选择座位").classList.add("add-setting");
				var seats = document.createElement("table");
				seats.classList.add("add-setting");
				seats.style.margin = "0";
				seats.style.width = "100%";
				seats.style.position = "relative";
				for (var i = 1; i <= game.players.length; i++) {
					var td = ui.create.div(".shadowed.reduce_radius.pointerdiv.tdnode");
					td.innerHTML = "<span>" + get.cnNumber(i, true) + "</span>";
					td.link = i - 1;
					seats.appendChild(td);
					td.addEventListener(lib.config.touchscreen ? "touchend" : "click", function () {
						if (_status.dragged) return;
						if (_status.justdragged) return;
						if (_status.cheat_seat) {
							_status.cheat_seat.classList.remove("bluebg");
							if (_status.cheat_seat == this) {
								delete _status.cheat_seat;
								return;
							}
						}
						this.classList.add("bluebg");
						_status.cheat_seat = this;
					});
				}
				dialog.content.appendChild(seats);
				if (game.me == game.zhu) {
					seats.previousSibling.style.display = "none";
					seats.style.display = "none";
				}

				dialog.add(ui.create.div(".placeholder.add-setting"));
				dialog.add(ui.create.div(".placeholder.add-setting"));
				if (get.is.phoneLayout()) dialog.add(ui.create.div(".placeholder.add-setting"));
			};
			var removeSetting = function () {
				var dialog = _status.event.dialog;
				if (dialog) {
					dialog.style.height = "";
					delete dialog._scrollset;
					var list = Array.from(dialog.querySelectorAll(".add-setting"));
					while (list.length) {
						list.shift().remove();
					}
					ui.update();
				}
			};
			event.addSetting = addSetting;
			event.removeSetting = removeSetting;

			var chosen = lib.config.continue_name || [];
			game.saveConfig("continue_name");
			event.chosen = chosen;

			var i;
			event.list = [];
			for (i in lib.character) {
				if (i.indexOf("gz_shibing") == 0) continue;
				if (chosen.includes(i)) continue;
				if (lib.filter.characterDisabled(i)) continue;
				if (get.config("onlyguozhan")) {
					if (!lib.characterGuozhanFilter.some(pack => lib.characterPack[pack][i])) continue;
					if (get.is.jun(i)) continue;
				}
				if (lib.character[i].hasHiddenSkill) continue;
				event.list.push(i);
			}
			_status.characterlist = event.list.slice(0);
			_status.yeidentity = [];
			if (_status.brawl && _status.brawl.chooseCharacterFilter) {
				event.list = _status.brawl.chooseCharacterFilter(event.list);
			}
			event.list.randomSort();
			// var list=event.list.splice(0,parseInt(get.config('choice_num')));
			var list;
			if (_status.brawl && _status.brawl.chooseCharacter) {
				list = _status.brawl.chooseCharacter(event.list, game.me);
			} else {
				list = game.getCharacterChoice(event.list, parseInt(get.config("choice_num")));
			}
			if (_status.auto) {
				event.ai(game.me, list);
				lib.init.onfree();
			} else if (chosen.length) {
				game.me.init(chosen[0], chosen[1], false);
				lib.init.onfree();
			} else {
				var dialog = ui.create.dialog("选择角色", "hidden", [list, "character"]);
				if (!_status.brawl || !_status.brawl.noAddSetting) {
					if (get.config("change_identity")) {
						addSetting(dialog);
					}
				}
				var next = game.me.chooseButton(dialog, true, 2).set("onfree", true);
				next.filterButton = function (button) {
					if (ui.dialog.buttons.length <= 10) {
						for (var i = 0; i < ui.dialog.buttons.length; i++) {
							if (ui.dialog.buttons[i] != button) {
								if (
									lib.element.player.perfectPair.call(
										{
											name1: button.link,
											name2: ui.dialog.buttons[i].link,
										},
										true
									)
								) {
									button.classList.add("glow2");
								}
							}
						}
					}
					if (lib.character[button.link].hasHiddenSkill) return false;
					var filterChoice = function (name1, name2) {
						if (_status.separatism) return true;
						var group1 = lib.character[name1][1];
						var group2 = lib.character[name2][1];
						var doublex = get.is.double(name1, true);
						if (doublex) {
							var double = get.is.double(name2, true);
							if (double) return doublex.some(group => double.includes(group));
							return doublex.includes(group2);
						} else {
							if (group1 == "ye") return group2 != "ye";
							var double = get.is.double(name2, true);
							if (double) return double.includes(group1);
							return group1 == group2;
						}
					};
					if (!ui.selected.buttons.length) {
						return ui.dialog.buttons.some(but => {
							if (but == button) return false;
							return filterChoice(button.link, but.link);
						});
					}
					return filterChoice(ui.selected.buttons[0].link, button.link);
				};
				next.switchToAuto = function () {
					event.ai(game.me, list);
					ui.arena.classList.remove("selecting");
				};
				var createCharacterDialog = function () {
					event.dialogxx = ui.create.characterDialog(
						"heightset",
						function (i) {
							if (i.indexOf("gz_shibing") == 0) return true;
							if (get.config("onlyguozhan")) {
								if (!lib.characterGuozhanFilter.some(pack => lib.characterPack[pack][i])) return true;
								if (get.is.jun(i)) return true;
							}
						},
						get.config("onlyguozhanexpand") ? "expandall" : undefined,
						get.config("onlyguozhan") ? "onlypack:mode_guozhan" : undefined
					);
					if (ui.cheat2) {
						ui.cheat2.addTempClass("controlpressdownx", 500);
						ui.cheat2.classList.remove("disabled");
					}
				};
				if (lib.onfree) {
					lib.onfree.push(createCharacterDialog);
				} else {
					createCharacterDialog();
				}
				ui.create.cheat2 = function () {
					ui.cheat2 = ui.create.control("自由选将", function () {
						if (this.dialog == _status.event.dialog) {
							if (game.changeCoin) {
								game.changeCoin(10);
							}
							this.dialog.close();
							_status.event.dialog = this.backup;
							this.backup.open();
							delete this.backup;
							game.uncheck();
							game.check();
							if (ui.cheat) {
								ui.cheat.addTempClass("controlpressdownx", 500);
								ui.cheat.classList.remove("disabled");
							}
						} else {
							if (game.changeCoin) {
								game.changeCoin(-10);
							}
							this.backup = _status.event.dialog;
							_status.event.dialog.close();
							_status.event.dialog = _status.event.parent.dialogxx;
							this.dialog = _status.event.dialog;
							this.dialog.open();
							game.uncheck();
							game.check();
							if (ui.cheat) {
								ui.cheat.classList.add("disabled");
							}
						}
					});
					if (lib.onfree) {
						ui.cheat2.classList.add("disabled");
					}
				};
				ui.create.cheat = function () {
					_status.createControl = ui.cheat2;
					ui.cheat = ui.create.control("更换", function () {
						if (ui.cheat2 && ui.cheat2.dialog == _status.event.dialog) {
							return;
						}
						if (game.changeCoin) {
							game.changeCoin(-3);
						}
						event.list = event.list.concat(list);
						event.list.randomSort();
						// list=event.list.splice(0,parseInt(get.config('choice_num')));
						list = game.getCharacterChoice(event.list, parseInt(get.config("choice_num")));
						var buttons = ui.create.div(".buttons");
						var node = _status.event.dialog.buttons[0].parentNode;
						_status.event.dialog.buttons = ui.create.buttons(list, "character", buttons);
						_status.event.dialog.content.insertBefore(buttons, node);
						buttons.addTempClass("start");
						node.remove();
						game.uncheck();
						game.check();
					});
					delete _status.createControl;
				};
				if (!_status.brawl || !_status.brawl.chooseCharacterFixed) {
					if (!ui.cheat && get.config("change_choice")) ui.create.cheat();
					if (!ui.cheat2 && get.config("free_choose")) ui.create.cheat2();
				}
			}
			("step 1");
			if (ui.cheat) {
				ui.cheat.close();
				delete ui.cheat;
			}
			if (ui.cheat2) {
				ui.cheat2.close();
				delete ui.cheat2;
			}
			if (result.buttons) {
				var name1 = result.buttons[0].link,
					name2 = result.buttons[1].link;
				event.choosen = [name1, name2];
				if (get.is.double(name1, true)) {
					if (!get.is.double(name2, true)) event._result = { control: lib.character[name2][1] };
					else if (get.is.double(name1, true).removeArray(get.is.double(name2, true)).length == 0 || get.is.double(name2, true).removeArray(get.is.double(name1, true)).length == 0)
						game.me
							.chooseControl(get.is.double(name2, true).filter(group => get.is.double(name1, true).includes(group)))
							.set("prompt", "请选择你代表的势力")
							.set("ai", () => _status.event.controls.randomGet());
					else
						event._result = {
							control: get.is.double(name1, true).find(group => get.is.double(name2, true).includes(group)),
						};
				} else if (lib.character[name1][1] == "ye" && get.is.double(name2, true))
					game.me
						.chooseControl(get.is.double(name2, true))
						.set("prompt", "请选择副将代表的势力")
						.set("ai", () => _status.event.controls.randomGet());
			}
			("step 2");
			if (result && result.control) game.me.trueIdentity = result.control;
			if (event.choosen) {
				game.me.init(event.choosen[0], event.choosen[1], false);
				game.addRecentCharacter(event.choosen[0], event.choosen[1]);
			}
			event.list.remove(game.me.name1);
			event.list.remove(game.me.name2);
			for (var i = 0; i < game.players.length; i++) {
				if (game.players[i] != game.me) {
					event.ai(game.players[i], game.getCharacterChoice(event.list, parseInt(get.config("choice_num"))), event.list);
				}
			}
			for (var i = 0; i < game.players.length; i++) {
				game.players[i].classList.add("unseen");
				game.players[i].classList.add("unseen2");
				_status.characterlist.remove(game.players[i].name);
				_status.characterlist.remove(game.players[i].name2);
				if (game.players[i] != game.me) {
					game.players[i].node.identity.firstChild.innerHTML = "猜";
					game.players[i].node.identity.dataset.color = "unknown";
					game.players[i].node.identity.classList.add("guessing");
				}
				game.players[i].hiddenSkills = lib.character[game.players[i].name1][3].slice(0);
				var hiddenSkills2 = lib.character[game.players[i].name2][3];
				for (var j = 0; j < hiddenSkills2.length; j++) {
					game.players[i].hiddenSkills.add(hiddenSkills2[j]);
				}
				for (var j = 0; j < game.players[i].hiddenSkills.length; j++) {
					if (!lib.skill[game.players[i].hiddenSkills[j]]) {
						game.players[i].hiddenSkills.splice(j--, 1);
					}
				}
				game.players[i].group = "unknown";
				game.players[i].sex = "unknown";
				game.players[i].name1 = game.players[i].name;
				game.players[i].name = "unknown";
				game.players[i].identity = "unknown";
				game.players[i].node.name.show();
				game.players[i].node.name2.show();
				for (var j = 0; j < game.players[i].hiddenSkills.length; j++) {
					game.players[i].addSkillTrigger(game.players[i].hiddenSkills[j], true);
				}
			}
			setTimeout(function () {
				ui.arena.classList.remove("choose-character");
			}, 500);
		});
	}
	chooseCharacterOL() {
		var next = game.createEvent("chooseCharacter");
		next.setContent(function () {
			"step 0";
			game.broadcastAll(function () {
				ui.arena.classList.add("choose-character");
				for (var i = 0; i < game.players.length; i++) {
					game.players[i].classList.add("unseen");
					game.players[i].classList.add("unseen2");
				}
			});
			var list = [];
			for (var i in lib.characterPack.mode_guozhan) {
				if (i.indexOf("gz_shibing") == 0) continue;
				if (get.is.jun(i)) continue;
				if (lib.config.guozhan_banned && lib.config.guozhan_banned.includes(i)) continue;
				list.push(i);
			}
			_status.characterlist = list.slice(0);
			_status.yeidentity = [];
			event.list = list.slice(0);
			var list2 = [];
			var num;
			if (lib.configOL.number * 6 > list.length) {
				num = 5;
			} else if (lib.configOL.number * 7 > list.length) {
				num = 6;
			} else {
				num = 7;
			}
			var filterButton = function (button) {
				if (ui.dialog) {
					if (ui.dialog.buttons.length <= 10) {
						for (var i = 0; i < ui.dialog.buttons.length; i++) {
							if (ui.dialog.buttons[i] != button) {
								if (
									lib.element.player.perfectPair.call(
										{
											name1: button.link,
											name2: ui.dialog.buttons[i].link,
										},
										true
									)
								) {
									button.classList.add("glow2");
								}
							}
						}
					}
				}
				var filterChoice = function (name1, name2) {
					if (_status.separatism) return true;
					var group1 = lib.character[name1][1];
					var group2 = lib.character[name2][1];
					var doublex = get.is.double(name1, true);
					if (doublex) {
						var double = get.is.double(name2, true);
						if (double) return doublex.some(group => double.includes(group));
						return doublex.includes(group2);
					} else {
						if (group1 == "ye") return group2 != "ye";
						var double = get.is.double(name2, true);
						if (double) return double.includes(group1);
						return group1 == group2;
					}
				};
				if (!ui.selected.buttons.length) {
					return ui.dialog.buttons.some(but => {
						if (but == button) return false;
						return filterChoice(button.link, but.link);
					});
				}
				return filterChoice(ui.selected.buttons[0].link, button.link);
			};
			list.randomSort();
			for (var i = 0; i < game.players.length; i++) {
				list2.push([
					game.players[i],
					["选择角色", [game.getCharacterChoice(list, num), "character"]],
					2,
					true,
					function () {
						return Math.random();
					},
					filterButton,
				]);
			}
			game.me
				.chooseButtonOL(list2, function (player, result) {
					if (game.online || player == game.me) player.init(result.links[0], result.links[1], false);
				})
				.set("switchToAuto", function () {
					_status.event.result = "ai";
				})
				.set("processAI", function () {
					var buttons = _status.event.dialog.buttons;
					var filterChoice = function (name1, name2) {
						if (_status.separatism) return true;
						var group1 = lib.character[name1][1];
						var group2 = lib.character[name2][1];
						var doublex = get.is.double(name1, true);
						if (doublex) {
							var double = get.is.double(name2, true);
							if (double) return doublex.some(group => double.includes(group));
							return doublex.includes(group2);
						} else {
							if (group1 == "ye") return group2 != "ye";
							var double = get.is.double(name2, true);
							if (double) return double.includes(group1);
							return group1 == group2;
						}
					};
					for (var i = 0; i < buttons.length - 1; i++) {
						for (var j = i + 1; j < buttons.length; j++) {
							if (filterChoice(buttons[i].link, buttons[j].link) || filterChoice(buttons[j].link, buttons[i].link)) {
								var mainx = buttons[i].link;
								var vicex = buttons[j].link;
								if (!filterChoice(mainx, vicex) || (filterChoice(vicex, mainx) && get.guozhanReverse(mainx, vicex))) {
									mainx = buttons[j].link;
									vicex = buttons[i].link;
								}
								var list = [mainx, vicex];
								return {
									bool: true,
									links: list,
								};
							}
						}
					}
				});
			("step 1");
			var sort = true,
				chosen = [],
				chosenCharacter = [];
			for (var i in result) {
				if (result[i] && result[i].links) {
					for (var j = 0; j < result[i].links.length; j++) {
						event.list.remove(result[i].links[j]);
					}
				}
			}
			for (var i in result) {
				if (result[i] == "ai" || !result[i].links || result[i].links.length < 1) {
					if (sort) {
						sort = false;
						event.list.randomSort();
					}
					result[i] = [event.list.shift()];
					var group = lib.character[result[i][0]][1];
					for (var j = 0; j < event.list.length; j++) {
						if (lib.character[event.list[j]][1] == group) {
							result[i].push(event.list[j]);
							event.list.splice(j--, 1);
							break;
						}
					}
				} else {
					result[i] = result[i].links;
				}
				var name1 = result[i][0],
					name2 = result[i][1];
				if (get.is.double(name1, true)) {
					if (!get.is.double(name2, true)) lib.playerOL[i].trueIdentity = lib.character[name2][1];
					else if (get.is.double(name1, true).removeArray(get.is.double(name2, true)).length == 0 || get.is.double(name2, true).removeArray(get.is.double(name1, true)).length == 0) {
						chosen.push(lib.playerOL[i]);
						chosenCharacter.push([name1, name2]);
					} else lib.playerOL[i].trueIdentity = get.is.double(name1, true).find(group => get.is.double(name2, true).includes(group));
				} else if (lib.character[name1][1] == "ye" && get.is.double(name2, true)) {
					chosen.push(lib.playerOL[i]);
					chosenCharacter.push([name1, name2]);
				}
			}
			event.result2 = result;
			if (chosen.length) {
				for (var i = 0; i < chosen.length; i++) {
					var name1 = chosenCharacter[i][0],
						name2 = chosenCharacter[i][1],
						str,
						choice;
					if (get.is.double(name1, true)) {
						str = "请选择你代表的势力";
						choice = get.is.double(name2, true).filter(group => get.is.double(name1, true).includes(group));
					}
					if (lib.character[name1][1] == "ye") {
						str = "请选择你的副将代表的势力";
						choice = get.is.double(name2, true);
					}
					chosen[i] = [
						chosen[i],
						[
							str,
							[
								choice.map(function (i) {
									return ["", "", "group_" + i];
								}),
								"vcard",
							],
						],
						1,
						true,
					];
				}
				game.me
					.chooseButtonOL(chosen, function (player, result) {
						if (player == game.me) player.trueIdentity = result.links[0][2].slice(6);
					})
					.set("switchToAuto", function () {
						_status.event.result = "ai";
					})
					.set("processAI", function () {
						return {
							bool: true,
							links: [_status.event.dialog.buttons.randomGet().link],
						};
					});
			} else event._result = {};
			("step 2");
			if (!result) result = {};
			var result2 = event.result2;
			game.broadcastAll(
				function (result, result2) {
					for (var i = 0; i < game.players.length; i++) {
						var current = game.players[i],
							id = current.playerid;
						if (result[id] && !current.name) {
							current.init(result[id][0], result[id][1], false);
						}
						if (result2[id] && result2[id].length) {
							current.trueIdentity = result2[id][0][2].slice(6);
						}
						if (game.players[i] != game.me) {
							game.players[i].node.identity.firstChild.innerHTML = "猜";
							game.players[i].node.identity.dataset.color = "unknown";
							game.players[i].node.identity.classList.add("guessing");
						}
						game.players[i].hiddenSkills = lib.character[game.players[i].name1][3].slice(0);
						var hiddenSkills2 = lib.character[game.players[i].name2][3];
						for (var j = 0; j < hiddenSkills2.length; j++) {
							game.players[i].hiddenSkills.add(hiddenSkills2[j]);
						}
						for (var j = 0; j < game.players[i].hiddenSkills.length; j++) {
							if (!lib.skill[game.players[i].hiddenSkills[j]]) {
								game.players[i].hiddenSkills.splice(j--, 1);
							}
						}
						game.players[i].group = "unknown";
						game.players[i].sex = "unknown";
						game.players[i].name1 = game.players[i].name;
						game.players[i].name = "unknown";
						game.players[i].identity = "unknown";
						game.players[i].node.name.show();
						game.players[i].node.name2.show();
						for (var j = 0; j < game.players[i].hiddenSkills.length; j++) {
							game.players[i].addSkillTrigger(game.players[i].hiddenSkills[j], true);
						}
					}
					setTimeout(function () {
						ui.arena.classList.remove("choose-character");
					}, 500);
				},
				result2,
				result
			);
		});
	}
}

/**
 *
 * @param {GameEvent} event
 * @param {GameEvent} _trigger
 * @param {Player} player
 */
export async function showYexingsContent(event, _trigger, player) {
	/** @type {Player[]} */
	// @ts-expect-error 类型就是这样的
	const yexingPlayers = game
		.filterPlayer(current => lib.character[current.name1][1] == "ye")
		// @ts-expect-error 祖宗之法就是这么写的
		.sortBySeat(_status.currentPhase);

	/** @type {Player[]} */
	let showYexingPlayers = [];
	for (const target of yexingPlayers) {
		const next = target.chooseBool("是否【暴露野心】，展示主将并继续战斗？", "若选择“否”，则视为本局游戏失败");

		next.set("ai", showCheck);

		if (await next.forResultBool()) {
			showYexingPlayers.push(target);
			target.$fullscreenpop("暴露野心", "thunder");
			game.log(target, "暴露了野心");
			await target.showCharacter(0);
			await game.delay(2);
		}

		/**
		 * 是否暴露野心的AI
		 *
		 * @param {GameEvent} _event
		 * @param {Player} _player
		 */
		function showCheck(_event, _player) {
			// TODO: 未来再想AI该怎么写
			return Math.random() < 0.5;
		}
	}

	// 如果没有人暴露野心，那么游戏结束
	if (showYexingPlayers.length === 0) {
		const winner = game.findPlayer(current => lib.character[current.name1][1] != "ye");

		if (winner) {
			broadcastAll(id => {
				// @ts-expect-error 祖宗之法就是这么写的
				game.winner_id = id;
			}, winner.playerid);
			// @ts-expect-error 祖宗之法就是这么写的
			game.checkResult();
		}

		// @ts-expect-error 祖宗之法就是这么写的
		delete _status.showYexings;
		return;
	}

	let yexingGroupList = ["夏", "商", "周", "秦", "汉", "隋", "唐", "宋", "辽", "金", "元", "明"];
	for (const target of showYexingPlayers) {
		// 基本不可能发生
		if (yexingGroupList.length === 0) {
			yexingGroupList = ["夏", "商", "周", "秦", "汉", "隋", "唐", "宋", "辽", "金", "元", "明"];
		}

		const next = target.chooseControl(yexingGroupList);

		next.set("prompt", "请选择自己所属的野心家势力的标识");
		next.set("ai", () => (yexingGroupList ? yexingGroupList.randomGet() : 0));

		/** @type {string} */
		let text;

		const control = await next.forResultControl();
		if (control) {
			text = control;
			yexingGroupList.remove(control);
		} else {
			text = yexingGroupList.randomRemove() ?? "野";
		}

		lib.group.push(text);
		lib.translate[`${text}2`] = text;
		lib.groupnature[text] = "kami";

		broadcastAll(
			/**
			 * @param {Player} player
			 * @param {string} text
			 */
			(player, text) => {
				player.identity = text;
				player.setIdentity(text, "kami");
			},
			target,
			text
		);

		target.changeGroup(text);
		target.removeMark("yexinjia_mark", 1);

		/** @type {Player[]} */
		// @ts-expect-error 祖宗之法就是这么写的
		const maybeFriends = game.players.filter(current => current.identity != "ye" && current !== target && !get.is.jun(current) && !yexingPlayers.includes(current) && !current.getStorage("yexinjia_friend").length);
		if (maybeFriends.length === 0) {
			continue;
		}

		/** @type {Player[]} */
		const refused = [];
		for (const other of maybeFriends) {
			target.line(other, "green");

			const next = other.chooseBool(`是否响应${get.translation(target)}发起的【拉拢人心】？`, `将势力改为${text}`);

			next.set("source", target);
			next.set("ai", check);

			if (await next.forResultBool()) {
				other.chat("加入");
				//event.targets4.push(target);
				broadcastAll(
					/**
					 * @param {Player} player
					 * @param {string} text
					 */
					(player, text) => {
						player.identity = text;
						player.setIdentity(text, "kami");
					},
					other,
					text
				);
				other.changeGroup(text);
			} else {
				other.chat("拒绝");
				refused.push(other);
			}

			/**
			 * @param {GameEvent} _event
			 * @param {Player} _player
			 * @returns {boolean}
			 */
			function check(_event, _player) {
				const player = get.player();
				const source = get.event("source");
				const friendsCount = target.getFriends(true).length;

				if (game.players.length <= 2 * friendsCount) {
					return false;
				}
				// @ts-expect-error 祖宗之法就是这么写的
				if (source.getFriends(true).length + friendsCount > game.players.length / 2) {
					return true;
				}

				if (player.isDamaged() || player.countCards("h") < 4) {
					return false;
				}

				return true;
			}
		}

		for (const other of refused) {
			await other.drawTo(4, []);
			await other.recover();
		}
	}

	// @ts-expect-error 祖宗之法就是这么写的
	delete _status.showYexings;
	if (
		!game.hasPlayer(current => {
			return game.hasPlayer(target => {
				return !target.isFriendOf(current);
			});
		})
	) {
		broadcastAll(id => {
			// @ts-expect-error 祖宗之法就是这么写的
			game.winner_id = id;
		}, event.source.playerid);
		// @ts-expect-error 祖宗之法就是这么写的
		game.checkResult();
	}
}

/**
 * `Game#broadcast`的类型兼容版本
 *
 * 未来或许会移动到别的地方，但目前先直接放国战里
 *
 * @template {(...args: any[]) => unknown} T
 * @param {T} func
 * @param {Parameters<T>} args
 */
export function broadcast(func, ...args) {
	// @ts-expect-error 类型就是这么写的
	return game.broadcast(func, ...args);
}

/**
 * `Game#broadcastAll`的类型兼容版本
 *
 * 未来或许会移动到别的地方，但目前先直接放国战里
 *
 * @template {(...args: any[]) => unknown} T
 * @param {T} func
 * @param {Parameters<T>} args
 */
export function broadcastAll(func, ...args) {
	// @ts-expect-error 类型就是这么写的
	return game.broadcastAll(func, ...args);
}
