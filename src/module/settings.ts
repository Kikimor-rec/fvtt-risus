export const registerSettings = function () {
	// Register any custom system settings here
	game.settings.register('risus', 'showPump', {
		name: 'SETTINGS.name.showPump',
		hint: 'SETTINGS.hint.showPump',
		scope: 'world',
		config: true,
		type: Boolean,
		default: false
	});

	game.settings.register('risus', 'defaultPump', {
		name: 'SETTINGS.name.defaultPump',
		hint: 'SETTINGS.hint.defaultPump',
		scope: 'world',
		config: true,
		type: Number,
		default: 0
	});
}
