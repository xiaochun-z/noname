import { lib, game, ui, get as _get, ai, _status } from "../../../../../noname.js";
import { GameEvent, Player, Card } from "../../../../../noname/library/element/index.js";
import { cast } from "../../../../../noname/util/index.js";
import { GetGuozhan } from "../../patch/get.js";
import { PlayerGuozhan } from "../../patch/player.js";
import { broadcastAll } from "../../patch/game.js";

/** @type {GetGuozhan}  */
const get = cast(_get);

/** @type {Record<string, Skill>} */
export default {
	// gz_dengai
	gz_jixi: {
		inherit: "jixi",
		audio: "jixi",
		mainSkill: true,
		init(player) {
			/** @type {PlayerGuozhan} */
			const playerRef = cast(player);
			if (playerRef.checkMainSkill("gz_jixi")) {
				playerRef.removeMaxHp();
			}
		},
	},
	ziliang: {
		audio: 2,
		trigger: {
			global: "damageEnd",
		},
		filter(event, player) {
			return event.player.isIn() && event.player.isFriendOf(player) && player.getExpansions("tuntian").length > 0;
		},
		init(player) {
			/** @type {PlayerGuozhan} */
			const playerRef = cast(player);
			playerRef.checkViceSkill("ziliang");
		},
		viceSkill: true,
		async cost(event, trigger, player) {
			const next = player.chooseCardButton(get.prompt("ziliang", trigger.player), player.getExpansions("tuntian"));

			next.set("ai", button => get.value(button.link));

			const result = await next.forResult();
			event.result = {
				bool: result.bool,
				cost_data: {
					links: result.links,
				},
			};
		},
		logTarget: "player",
		async content(event, trigger, player) {
			const card = event.cost_data.links[0];
			await player.give(card, trigger.player);
		},
	},
};
