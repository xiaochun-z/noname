import { lib, game as _game, ui, get, ai, _status } from "../../../../noname.js";
import { GameEvent, Dialog, Player, Control, Button } from "../../../../noname/library/element/index.js";
import { GameGuozhan, broadcastAll } from "./game.js";
import { delay } from "../../../../noname/util/index.js";

/** @type {GameGuozhan} */
// @ts-expect-error 类型就是这么定的
const game = _game;
const html = String.raw;

/**
 *
 * @param {GameEvent} event
 * @param {GameEvent} _trigger
 * @param {Player} _player
 */
export async function chooseCharacterContent(event, _trigger, _player) {
	ui.arena.classList.add("choose-character");

	Reflect.set(event, "addSetting", addSetting);
	Reflect.set(event, "removeSetting", removeSetting);

	// 再战的角色选择
	const chosen = lib.config.continue_name || [];
	game.saveConfig("continue_name");
	Reflect.set(event, "chosen", chosen);

	// 获取可选择的角色
	/** @type {string[]} */
	let characterList = [];
	for (const character in lib.character) {
		if (character.indexOf("gz_shibing") == 0) continue;
		if (chosen.includes(character)) continue;
		if (lib.filter.characterDisabled(character)) continue;
		if (get.config("onlyguozhan")) {
			if (!lib.characterGuozhanFilter.some(pack => lib.characterPack[pack][character])) continue;
			if (get.is.jun(character)) continue;
		}
		if (lib.character[character].hasHiddenSkill) continue;
		characterList.push(character);
	}
	Reflect.set(_status, "characterlist", characterList.slice(0));
	Reflect.set(_status, "yeidentity", []);

	// 乱斗模式下对武将的过滤
	if (_status.brawl && _status.brawl.chooseCharacterFilter) {
		characterList = _status.brawl.chooseCharacterFilter(characterList);
	}

	characterList.randomSort();

	// 获取玩家能选择的角色
	/** @type {string[]} */
	let chooseList;
	if (_status.brawl && _status.brawl.chooseCharacter) {
		chooseList = _status.brawl.chooseCharacter(characterList, game.me);
	} else {
		chooseList = game.getCharacterChoice(characterList, parseInt(get.config("choice_num")));
	}

	// 如果托管，则自动选择
	if (_status.auto && event.ai != null) {
		event.ai(game.me, chooseList);
		lib.init.onfree();
	}
	// 如果存在“再战”记录，则使用该记录
	else if (chosen.length) {
		game.me.init(chosen[0], chosen[1], false, void 0);
		lib.init.onfree();
	}
	// 反之，显示选择角色的对话框
	else {
		const result = await createChooseCharacterDialog().forResult();

		// 关闭已打开的额外对话框
		for (const name of ["cheat", "cheat2"]) {
			if (!Reflect.has(ui, name)) {
				continue;
			}

			Reflect.get(ui, name).close();
			Reflect.deleteProperty(ui, name);
		}

		if (result.buttons) {
			/** @type {string} */
			// @ts-expect-error 祖宗之法就是这么写的
			const name1 = result.buttons[0].link;
			/** @type {string} */
			// @ts-expect-error 祖宗之法就是这么写的
			const name2 = result.buttons[1].link;
			const characterChosen = [name1, name2];

			/** @type {Partial<Result>?} */
			let result2 = null;

			// @ts-expect-error 祖宗之法就是这么写的
			if (get.is.double(name1, true)) {
				// @ts-expect-error 祖宗之法就是这么写的
				if (!get.is.double(name2, true)) {
					result2 = { control: lib.character[name2][1] };
				}
				// 仙人之兮列如麻
				// @ts-expect-error 祖宗之法就是这么写的
				else if (get.is.double(name1, true).removeArray(get.is.double(name2, true)).length == 0 || get.is.double(name2, true).removeArray(get.is.double(name1, true)).length == 0) {
					const next = game.me
						// @ts-expect-error 祖宗之法就是这么写的
						.chooseControl(get.is.double(name2, true).filter(group => get.is.double(name1, true).includes(group)));

					next.set("prompt", "请选择你代表的势力");
					// @ts-expect-error 祖宗之法就是这么写的
					next.set("ai", () => _status.event.controls.randomGet());

					result2 = await next.forResult();
				} else {
					result2 = {
						// @ts-expect-error 祖宗之法就是这么写的
						control: get.is.double(name1, true).find(group => get.is.double(name2, true).includes(group)),
					};
				}
			}
			// @ts-expect-error 祖宗之法就是这么写的
			else if (lib.character[name1][1] == "ye" && get.is.double(name2, true)) {
				const next = game.me
					// @ts-expect-error 祖宗之法就是这么写的
					.chooseControl(get.is.double(name2, true));

				next.set("prompt", "请选择副将代表的势力");
				// @ts-expect-error 祖宗之法就是这么写的
				next.set("ai", () => _status.event.controls.randomGet());

				result = await next.forResult();
			}

			if (result2?.control) {
				// @ts-expect-error 祖宗之法就是这么写的
				game.me.trueIdentity = result2.control;
			}
			if (characterChosen) {
				game.me.init(characterChosen[0], characterChosen[1], false, void 0);
				game.addRecentCharacter(characterChosen[0], characterChosen[1]);
			}
			characterList.remove(game.me.name1);
			characterList.remove(game.me.name2);
		}
	}

	Reflect.set(_status, "_startPlayerNames", {
		name: game.me.name,
		name1: game.me.name1,
		name2: game.me.name2,
	});

	for (const player of game.players) {
		if (player != game.me) {
			event.ai?.(player, game.getCharacterChoice(characterList, parseInt(get.config("choice_num"))), characterList);
		}
	}

	for (let i = 0; i < game.players.length; ++i) {
		game.players[i].classList.add("unseen");
		game.players[i].classList.add("unseen2");
		// @ts-expect-error 祖宗之法就是这么写的
		_status.characterlist.remove(game.players[i].name);
		// @ts-expect-error 祖宗之法就是这么写的
		_status.characterlist.remove(game.players[i].name2);
		if (game.players[i] != game.me) {
			// @ts-expect-error 祖宗之法就是这么写的
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
			// @ts-expect-error 祖宗之法就是这么写的
			game.players[i].addSkillTrigger(game.players[i].hiddenSkills[j], true);
		}
	}

	delay(500).then(() => {
		ui.arena.classList.remove("choose-character");
	});

	return;

	/**
	 * @param {Dialog} dialog
	 */
	function addSetting(dialog) {
		const seatNode = dialog.add("选择座位");
		if (typeof seatNode === "object" && seatNode instanceof HTMLElement) {
			seatNode.classList.add("add-setting");
		}

		const seats = document.createElement("table");
		seats.classList.add("add-setting");
		seats.style.margin = "0";
		seats.style.width = "100%";
		seats.style.position = "relative";

		for (let i = 1; i <= game.players.length; ++i) {
			const td = ui.create.div(".shadowed.reduce_radius.pointerdiv.tdnode");
			td.innerHTML = html`<span>${get.cnNumber(i, true)}</span>`;
			Reflect.set(td, "link", i - 1);

			seats.appendChild(td);

			td.addEventListener("pointerup", onPointerup);

			/**
			 * @param {PointerEvent} event
			 */
			function onPointerup(event) {
				// 对于输入，必须被识别为“主要输入”，如鼠标左键或单点触控
				// 如果不是主要输入，则忽略
				if (!event.isPrimary) {
					return;
				}

				// 对于鼠标来说，必须是左键点击（对应click）
				if (event.button != 0) {
					return;
				}

				// 如果目前有正在拖拽的元素，就忽略当前点击
				if (_status.dragged) {
					return;
				}
				// 后面不知道，略过
				// @ts-expect-error 祖宗之法就是这么写的
				if (_status.justdragged) return;
				// @ts-expect-error 祖宗之法就是这么写的
				if (_status.cheat_seat) {
					// @ts-expect-error 祖宗之法就是这么写的
					_status.cheat_seat.classList.remove("bluebg");
					// @ts-expect-error 祖宗之法就是这么写的
					if (_status.cheat_seat == this) {
						// @ts-expect-error 祖宗之法就是这么写的
						delete _status.cheat_seat;
						return;
					}
				}
				this.classList.add("bluebg");
				// @ts-expect-error 祖宗之法就是这么写的
				_status.cheat_seat = this;
			}
		}

		dialog.content.appendChild(seats);

		dialog.add(ui.create.div(".placeholder.add-setting"));
		dialog.add(ui.create.div(".placeholder.add-setting"));
		if (get.is.phoneLayout()) {
			dialog.add(ui.create.div(".placeholder.add-setting"));
		}
	}

	function removeSetting() {
		const event = get.event();
		/** @type {Dialog?} */
		const dialog = Reflect.get(event, "dialog");
		if (dialog == null) {
			return;
		}

		dialog.style.height = "";
		Reflect.deleteProperty(dialog, "_scrollset");

		const list = dialog.querySelectorAll(".add-setting");

		for (const node of list) {
			node.remove();
		}

		ui.update();
	}

	function createChooseCharacterDialog() {
		const dialog = ui.create.dialog("选择角色", "hidden", [chooseList, "character"]);

		// 如果是乱斗模式，添加额外的设置
		if (!_status.brawl || !_status.brawl.noAddSetting) {
			if (get.config("change_identity")) {
				addSetting(dialog);
			}
		}

		const next = game.me.chooseButton(dialog, true, 2);

		next.set("onfree", true);
		next.set("filterButton", filterButton);
		next.set("switchToAuto", switchToAuto);

		if (lib.onfree) {
			lib.onfree.push(createCharacterDialog);
		} else {
			createCharacterDialog();
		}

		Reflect.set(ui.create, "cheat2", createCheat2);
		Reflect.set(ui.create, "cheat", createCheat);

		if (!_status.brawl || !_status.brawl.chooseCharacterFixed) {
			// @ts-expect-error 祖宗之法就是这么写的
			if (!ui.cheat && get.config("change_choice")) ui.create.cheat();
			// @ts-expect-error 祖宗之法就是这么写的
			if (!ui.cheat2 && get.config("free_choose")) ui.create.cheat2();
		}

		return next;

		/**
		 * @param {Button} button
		 */
		function filterButton(button) {
			if (ui.dialog.buttons.length <= 10) {
				for (var i = 0; i < ui.dialog.buttons.length; i++) {
					if (ui.dialog.buttons[i] != button) {
						if (
							// @ts-expect-error 祖宗之法就是这么写的
							lib.element.player.perfectPair.call(
								{
									// @ts-expect-error 祖宗之法就是这么写的
									name1: button.link,
									// @ts-expect-error 祖宗之法就是这么写的
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
			// @ts-expect-error 祖宗之法就是这么写的
			if (lib.character[button.link].hasHiddenSkill) return false;
			var filterChoice = function (name1, name2) {
				// @ts-expect-error 祖宗之法就是这么写的
				if (_status.separatism) return true;
				var group1 = lib.character[name1][1];
				var group2 = lib.character[name2][1];
				// @ts-expect-error 祖宗之法就是这么写的
				var doublex = get.is.double(name1, true);
				if (doublex) {
					// @ts-expect-error 祖宗之法就是这么写的
					var double = get.is.double(name2, true);
					// @ts-expect-error 祖宗之法就是这么写的
					if (double) return doublex.some(group => double.includes(group));
					// @ts-expect-error 祖宗之法就是这么写的
					return doublex.includes(group2);
				} else {
					if (group1 == "ye") return group2 != "ye";
					// @ts-expect-error 祖宗之法就是这么写的
					var double = get.is.double(name2, true);
					// @ts-expect-error 祖宗之法就是这么写的
					if (double) return double.includes(group1);
					return group1 == group2;
				}
			};
			if (!ui.selected.buttons.length) {
				return ui.dialog.buttons.some(but => {
					if (but == button) return false;
					// @ts-expect-error 祖宗之法就是这么写的
					return filterChoice(button.link, but.link);
				});
			}
			// @ts-expect-error 祖宗之法就是这么写的
			return filterChoice(ui.selected.buttons[0].link, button.link);
		}

		function switchToAuto() {
			event.ai?.(game.me, chooseList);
			ui.arena.classList.remove("selecting");
		}
	}

	function createCharacterDialog() {
		const dialogxx = ui.create.characterDialog(
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
		Reflect.set(event, "dialogxx", dialogxx);

		const cheat2 = Reflect.get(ui, "cheat2");
		if (cheat2 != null) {
			cheat2.addTempClass("controlpressdownx", 500);
			cheat2.classList.remove("disabled");
		}
	}

	function createCheat2() {
		const cheat2 = ui.create.control("自由选将", onClick);
		Reflect.set(ui, "cheat2", cheat2);

		if (lib.onfree) {
			cheat2.classList.add("disabled");
		}

		/** @this {Control} */
		function onClick() {
			// @ts-expect-error 祖宗之法就是这么写的
			if (this.dialog == _status.event?.dialog) {
				// @ts-expect-error 祖宗之法就是这么写的
				if (game.changeCoin) {
					// @ts-expect-error 祖宗之法就是这么写的
					game.changeCoin(10);
				}
				// @ts-expect-error 祖宗之法就是这么写的
				this.dialog.close();
				// @ts-expect-error 祖宗之法就是这么写的
				_status.event.dialog = this.backup;
				// @ts-expect-error 祖宗之法就是这么写的
				this.backup.open();
				// @ts-expect-error 祖宗之法就是这么写的
				delete this.backup;
				game.uncheck();
				game.check();
				// @ts-expect-error 祖宗之法就是这么写的
				if (ui.cheat) {
					// @ts-expect-error 祖宗之法就是这么写的
					ui.cheat.addTempClass("controlpressdownx", 500);
					// @ts-expect-error 祖宗之法就是这么写的
					ui.cheat.classList.remove("disabled");
				}
			} else {
				// @ts-expect-error 祖宗之法就是这么写的
				if (game.changeCoin) {
					// @ts-expect-error 祖宗之法就是这么写的
					game.changeCoin(-10);
				}
				// @ts-expect-error 祖宗之法就是这么写的
				this.backup = _status.event.dialog;
				// @ts-expect-error 祖宗之法就是这么写的
				_status.event.dialog.close();
				// @ts-expect-error 祖宗之法就是这么写的
				_status.event.dialog = _status.event.parent.dialogxx;
				// @ts-expect-error 祖宗之法就是这么写的
				this.dialog = _status.event.dialog;
				// @ts-expect-error 祖宗之法就是这么写的
				this.dialog.open();
				game.uncheck();
				game.check();
				// @ts-expect-error 祖宗之法就是这么写的
				if (ui.cheat) {
					// @ts-expect-error 祖宗之法就是这么写的
					ui.cheat.classList.add("disabled");
				}
			}
		}
	}

	function createCheat() {
		// @ts-expect-error 祖宗之法就是这么写的
		_status.createControl = ui.cheat2;
		const cheat = ui.create.control("更换", function () {
			// @ts-expect-error 祖宗之法就是这么写的
			if (ui.cheat2 && ui.cheat2.dialog == _status.event.dialog) {
				return;
			}
			// @ts-expect-error 祖宗之法就是这么写的
			if (game.changeCoin) {
				// @ts-expect-error 祖宗之法就是这么写的
				game.changeCoin(-3);
			}
			characterList = characterList.concat(chooseList);
			characterList.randomSort();
			// list=event.list.splice(0,parseInt(get.config('choice_num')));
			chooseList = game.getCharacterChoice(characterList, parseInt(get.config("choice_num")));
			var buttons = ui.create.div(".buttons");
			// @ts-expect-error 祖宗之法就是这么写的
			var node = _status.event.dialog.buttons[0].parentNode;
			// @ts-expect-error 祖宗之法就是这么写的
			_status.event.dialog.buttons = ui.create.buttons(chooseList, "character", buttons);
			// @ts-expect-error 祖宗之法就是这么写的
			_status.event.dialog.content.insertBefore(buttons, node);
			buttons.addTempClass("start");
			node.remove();
			game.uncheck();
			game.check();
		});
		Reflect.set(ui, "cheat", cheat);
		// @ts-expect-error 祖宗之法就是这么写的
		delete _status.createControl;
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
	// @ts-expect-error 祖宗之法就是这么做的
	const yexingPlayers = game
		// @ts-expect-error 祖宗之法就是这么做的
		.filterPlayer(current => lib.character[current.name1][1] == "ye" && !current._showYexing)
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

			broadcastAll(
				/**
				 * @param {Player} player
				 */
				player => {
					// @ts-expect-error 祖宗之法就是这么做的
					player._showYexing = true;
				},
				player
			);
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
		// @ts-expect-error 祖宗之法就是这么做的
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
				const friendsCount = target.getFriends(true, false).length;

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

	// 如果此时因为机缘巧合，所有玩家均属于一个阵营，则直接获胜
	for (const target of showYexingPlayers) {
		if (game.hasPlayer(current => !current.isFriendOf(target))) {
			continue;
		}

		broadcastAll(id => {
			// @ts-expect-error 祖宗之法就是这么写的
			game.winner_id = id;
		}, target.playerid);
		game.checkResult();
		break;
	}
}
