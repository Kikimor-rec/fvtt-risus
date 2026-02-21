export const preloadTemplates = async function () {
	const templatePaths = [
		"systems/risus/templates/actor/character-sheet.html",

		"systems/risus/templates/item/cliche-sheet.html",
		"systems/risus/templates/item/gear-sheet.html",
	];

	return loadTemplates(templatePaths);
}
