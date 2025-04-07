import { lib, game, ui, get, ai, _status } from "../../noname.js";

const dynamicTranslates = {
	nzry_juzhan(player) {
		if (player.storage.nzry_juzhan == true) return '转换技，阴：当你成为其他角色【杀】的目标后，你可以与其各摸一张牌，然后其本回合内不能再对你使用牌。<span class="bluetext">阳：当你使用【杀】指定一名角色为目标后，你可以获得其一张牌，然后你本回合内不能再对其使用牌。</span>';
		return '转换技，<span class="bluetext">阴：当你成为其他角色【杀】的目标后，你可以与其各摸一张牌，然后其本回合内不能再对你使用牌。</span>阳：当你使用【杀】指定一名角色为目标后，你可以获得其一张牌，然后你本回合内不能再对其使用牌。';
	},
	nzry_zhenliang(player) {
		if (player.storage.nzry_zhenliang == true) return '转换技，阴：出牌阶段限一次，你可以弃置一张与“任”颜色相同的牌并对攻击范围内的一名角色造成1点伤害。<span class="bluetext">阳：当你于回合外使用或打出的牌结算完成后，若此牌与“任”颜色相同，则你可以令一名角色摸一张牌。</span>';
		return '转换技，<span class="bluetext">阴：出牌阶段限一次，你可以弃置一张与“任”颜色相同的牌并对攻击范围内的一名角色造成1点伤害。</span>阳：当你于回合外使用或打出的牌结算完成后，若此牌与“任”颜色相同，则你可以令一名角色摸一张牌。';
	},
	nzry_chenglve(player) {
		if (player.storage.nzry_chenglve == true) return '转换技，出牌阶段限一次，阴：你可以摸一张牌，然后弃置两张手牌。<span class="bluetext">阳：你可以摸两张牌，然后弃置一张手牌。</span>若如此做，直到本回合结束，你使用与弃置牌花色相同的牌无距离和次数限制。';
		return '转换技，出牌阶段限一次，<span class="bluetext">阴：你可以摸一张牌，然后弃置两张手牌。</span>阳：你可以摸两张牌，然后弃置一张手牌。若如此做，直到本回合结束，你使用与弃置牌花色相同的牌无距离和次数限制。';
	},
	nzry_shenshi(player) {
		if (player.storage.nzry_shenshi == true) return '转换技，阴：出牌阶段限一次，你可以将一张牌交给一名手牌数最多的角色，然后对其造成1点伤害，若该角色因此死亡，则你可以令一名角色将手牌摸至四张。<span class="bluetext">阳：其他角色对你造成伤害后，你可以观看该角色的手牌，然后交给其一张牌，当前角色回合结束时，若此牌仍在该角色的手牌区或装备区，你将手牌摸至四张。</span>';
		return '转换技，<span class="bluetext">阴：出牌阶段限一次，你可以将一张牌交给一名手牌数最多的角色，然后对其造成1点伤害，若该角色因此死亡，则你可以令一名角色将手牌摸至四张。</span>阳：其他角色对你造成伤害后，你可以观看该角色的手牌，然后交给其一张牌，当前角色回合结束时，若此牌仍在该角色的手牌区或装备区，你将手牌摸至四张。';
	},
};
export default dynamicTranslates;
