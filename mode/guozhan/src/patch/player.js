import { lib, game, ui, get, ai, _status } from "../../../../noname.js";
import { GameEvent, Dialog, Player } from "../../../../noname/library/element/index.js";

export class PlayerGuozhan extends Player {
	/**
	 * @type {string}
	 */
	trueIdentity;

	/**
	 * 获取玩家的势力
	 *
	 * @param {Number} [num = 0] - 根据哪张武将牌返回势力，`0`为主将，`1`为副将（默认为0）
	 * @returns {string}
	 */
	getGuozhanGroup(num = 0) {
		if (this.trueIdentity) {
			if (lib.character[this.name1][1] != "ye" || num == 1) {
				return this.trueIdentity;
			}
			return "ye";
		}
		if (get.is.double(this.name2)) {
			return lib.character[this.name1].group;
		}
		if (num == 1) {
			return lib.character[this.name2].group;
		}
		return lib.character[this.name1].group;
	}

	/**
	 * 选择军令
	 * 
	 * @param {Player} target 
	 * @returns 
	 */
	chooseJunlingFor(target) {
		const next = game.createEvent("chooseJunlingFor");

		// @ts-expect-error 类型就是这么写的
		next.player = this;
		next.target = target;
		next.num = 2;

		// @ts-expect-error 类型就是这么写的
		next.setContent("chooseJunlingFor");
		
		return next;
	}
}
