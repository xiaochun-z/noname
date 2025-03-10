import { lib, game as _game, ui, get, ai, _status } from "../../../../noname.js";
import { GameGuozhan, broadcastAll } from "./game.js";

/** @type {GameGuozhan} */
// @ts-expect-error 类型就是这么定的
const game = _game;

/**
 *
 * @param {GameEvent} event
 * @param {GameEvent} _trigger
 * @param {Player} player
 */
export async function showYexingsContent(event, _trigger, player) {
	/** @type {Player[]} */
	const yexingPlayers = game
		.filterPlayer(current => lib.character[current.name1][1] == "ye" && current.identity == "ye")
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
