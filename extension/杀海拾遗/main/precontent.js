import { lib, game, ui, get, ai, _status } from "./utils.js";

export async function precontent(config, pack) {
	/**
	 * 同时加载多个扩展包
	 * @param { string } pack
	 * @param { string } name
	 * @param { string[] } types
	 * @returns { Promise<boolean> }
	 */
	async function loadPack(pack, name, types) {
		try {
			let extensions = [];
			for (let type of types) {
				extensions.push(import(`../${type}/${pack}/index.js`));
			}
			await Promise.all(extensions);
			for (let type of types) {
				lib.translate[`${pack}_${type}_config`] = name;
			}
			return true;
		} catch (err) {
			console.error("Failed to import extension 『杀海拾遗』: ", err);
			alert(`『杀海拾遗』扩展加载“${name}”扩展包时失败`);
			return false;
		}
	}
	if (lib.config.extension_杀海拾遗_gwent) {
		// 依赖项是否加载成功
		let success =
			(await loadPack("gwent", "昆特牌", ["card", "character"])) &&
			// “古剑奇谭”依赖“昆特牌”
			(await loadPack("gujian", "古剑奇谭", ["card", "character"]));
		if (lib.config.extension_杀海拾遗_yunchou) {
			if ((await loadPack("yunchou", "运筹帷幄", ["card", "character"])) && success) {
				// 以下这些扩展包彼此依赖且依赖“古剑奇谭”和“运筹帷幄”
				try {
					await Promise.all([import("../card/hearth/index.js"), import("../card/swd/index.js"), import("../character/hearth/index.js"), import("../character/ow/index.js"), import("../character/swd/index.js"), import("../character/xianjian/index.js")]);
					lib.translate.hearth_character_config = "炉石传说";
					lib.translate.hearth_card_config = "炉石传说";
					lib.translate.ow_character_config = "守望先锋";
					lib.translate.swd_character_config = "轩辕剑";
					lib.translate.swd_card_config = "轩辕剑";
					lib.translate.xianjian_character_config = "仙剑奇侠传";
				} catch (err) {
					console.error("Failed to import extension 『杀海拾遗』: ", err);
					alert("Error:『杀海拾遗』扩展加载扩展包失败");
				}
			}
		}
	} else if (lib.config.extension_杀海拾遗_yunchou) {
		await loadPack("yunchou", "运筹帷幄", ["card", "character"]);
	}
	if (lib.config.extension_杀海拾遗_mtg) {
		await loadPack("mtg", "万智牌", ["card", "character"]);
	}
	if (lib.config.extension_杀海拾遗_wuxing) {
		await loadPack("wuxing", "五行生克", ["play"]);
	}
	if (lib.config.extension_杀海拾遗_zhenfa) {
		await loadPack("zhenfa", "阵法牌", ["card"]);
	}
}
