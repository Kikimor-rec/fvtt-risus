/**
 * Risus: The Anything RPG — FoundryVTT System
 * Updated for FoundryVTT V13 compatibility.
 */

// Import TypeScript modules
import { registerSettings } from './module/settings.js';
import { preloadTemplates } from './module/preloadTemplates.js';
import { registerHandlebars } from './module/handlebars.js';

import { RisusActor } from './module/actor/actor.js';
import { RisusCharacterSheet } from './module/actor/actorSheet.js';
import { RisusItem } from './module/item/item.js';
import { RisusItemSheet } from './module/item/itemSheet.js';

/* ------------------------------------ */
/* Initialize system                    */
/* ------------------------------------ */
Hooks.once('init', async function () {
	console.log('risus | Initializing risus');

	// Assign custom classes and constants here
	(game as any).risus = {
		RisusActor,
		RisusItem
	};

	// V13: use documentClass instead of entityClass
	CONFIG.Actor.documentClass = RisusActor as any;
	CONFIG.Item.documentClass = RisusItem as any;

	// Register custom system settings
	registerSettings();
	registerHandlebars();

	// Preload Handlebars templates
	await preloadTemplates();

	// Register custom sheets (if any)
	Actors.unregisterSheet('core', ActorSheet);
	Actors.registerSheet('risus', RisusCharacterSheet, {
		// types: ['character'],
		makeDefault: true,
	});

	Items.unregisterSheet('core', ItemSheet);
	Items.registerSheet('risus', RisusItemSheet, { makeDefault: true });
});

/* ------------------------------------ */
/* Setup system                         */
/* ------------------------------------ */
Hooks.once('setup', function () {
	// Do anything after initialization but before ready
});

/* ------------------------------------ */
/* When ready                           */
/* ------------------------------------ */
Hooks.once('ready', function () {
	// Do anything once the system is ready
});
