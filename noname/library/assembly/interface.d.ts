import { Button, Card, GameEvent, GameEventPromise, Player } from "../element";

export interface NonameAssemblyType {
	checkBegin: {};

	checkCard: {
		/**
		 *
		 * @param card - 检查的卡牌
		 * @param event - 当前检查的事件
		 */
		updateTempname(card: Card, event: GameEvent & GameEventPromise): void;
	};

	checkTarget: {
		/**
		 *
		 * @param target - 检查的玩家
		 * @param event - 当前检查的事件
		 */
		updateInstance(target: Player, event: GameEvent & GameEventPromise): void;
	};

	checkButton: {};

	checkEnd: {
		/**
		 *
		 * @param event - 当前检查的事件
		 * @param config - 一些配置
		 */
		autoConfirm(
			event: GameEvent & GameEventPromise,
			config: { ok: boolean; auto: boolean; autoConfirm: boolean }
		): void;
	};

	uncheckBegin: {};

	uncheckCard: {
		/**
		 *
		 * @param card - 取消检查的卡牌
		 * @param event - 当前检查的事件
		 */
		removeTempname(card: Card, event: GameEvent & GameEventPromise): void;
	};

	uncheckTarget: {
		/**
		 *
		 * @param target - 取消检查的玩家
		 * @param event - 当前检查的事件
		 */
		removeInstance(target: Player, event: GameEvent & GameEventPromise): void;
	};

	uncheckButton: {};

	uncheckEnd: {};
}
