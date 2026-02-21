const gulp = require('gulp');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const archiver = require('archiver');
const stringify = require('json-stringify-pretty-compact');

const ts = require('gulp-typescript');
// gulp-sass v5+: compiler is passed directly to the constructor
const sass = require('gulp-sass')(require('sass'));
const git = require('gulp-git');

const argv = require('yargs').argv;

function getConfig() {
	const configPath = path.resolve(process.cwd(), 'foundryconfig.json');
	let config;

	if (fs.existsSync(configPath)) {
		config = fs.readJSONSync(configPath);
		return config;
	} else {
		return;
	}
}

function getManifest() {
	const json = {};

	if (fs.existsSync('src')) {
		json.root = 'src';
	} else {
		json.root = 'dist';
	}

	const modulePath = path.join(json.root, 'module.json');
	const systemPath = path.join(json.root, 'system.json');

	if (fs.existsSync(modulePath)) {
		json.file = fs.readJSONSync(modulePath);
		json.name = 'module.json';
	} else if (fs.existsSync(systemPath)) {
		json.file = fs.readJSONSync(systemPath);
		json.name = 'system.json';
	} else {
		return;
	}

	return json;
}

// TypeScript project — no custom transformer needed because .js extensions
// are explicitly written in the source import statements.
const tsConfig = ts.createProject('tsconfig.json');

/********************/
/*		BUILD		*/
/********************/

/**
 * Build TypeScript — compiles .ts → .js only.
 * Using tsResult.js ensures only compiled JS files reach dist/
 * (gulp-typescript would otherwise pass through .ts/.d.ts files too).
 */
function buildTS() {
	const tsResult = gulp.src('src/**/*.ts').pipe(tsConfig());
	return tsResult.js.pipe(gulp.dest('dist'));
}

/**
 * Build SASS
 */
function buildSASS() {
	// gulp-sass v5+: use sass() directly; sync is the default
	return gulp
		.src('src/*.scss')
		.pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError))
		.pipe(gulp.dest('dist'));
}

/**
 * Copy static files
 */
async function copyFiles() {
	const statics = [
		'lang',
		'fonts',
		'assets',
		'templates',
		'module.json',
		'system.json',
		'template.json',
	];
	try {
		for (const file of statics) {
			if (fs.existsSync(path.join('src', file))) {
				await fs.copy(path.join('src', file), path.join('dist', file));
			}
		}
		return Promise.resolve();
	} catch (err) {
		Promise.reject(err);
	}
}

/**
 * Watch for changes for each build step
 */
function buildWatch() {
	gulp.watch('src/**/*.ts', { ignoreInitial: false }, buildTS);
	gulp.watch('src/**/*.scss', { ignoreInitial: false }, buildSASS);
	gulp.watch(
		['src/fonts', 'src/lang', 'src/templates', 'src/*.json'],
		{ ignoreInitial: false },
		copyFiles
	);
}

/********************/
/*		CLEAN		*/
/********************/

/**
 * Remove all built files from `dist` folder.
 */
async function clean() {
	console.log(' ', chalk.yellow('Cleaning dist/'));
	try {
		await fs.remove('dist');
		return Promise.resolve();
	} catch (err) {
		return Promise.reject(err);
	}
}

/********************/
/*		LINK		*/
/********************/

/**
 * Link build to User Data folder
 */
async function linkUserData() {
	const name = path.basename(path.resolve('.'));
	const config = fs.readJSONSync('foundryconfig.json');

	let destDir;
	try {
		if (
			fs.existsSync(path.resolve('.', 'dist', 'module.json')) ||
			fs.existsSync(path.resolve('.', 'src', 'module.json'))
		) {
			destDir = 'modules';
		} else if (
			fs.existsSync(path.resolve('.', 'dist', 'system.json')) ||
			fs.existsSync(path.resolve('.', 'src', 'system.json'))
		) {
			destDir = 'systems';
		} else {
			throw Error(
				`Could not find ${chalk.blueBright(
					'module.json'
				)} or ${chalk.blueBright('system.json')}`
			);
		}

		let linkDir;
		if (config.dataPath) {
			if (!fs.existsSync(path.join(config.dataPath, 'Data')))
				throw Error('User Data path invalid, no Data directory found');

			linkDir = path.join(config.dataPath, 'Data', destDir, name);
		} else {
			throw Error('No User Data path defined in foundryconfig.json');
		}

		if (argv.clean || argv.c) {
			console.log(
				chalk.yellow(`Removing build in ${chalk.blueBright(linkDir)}`)
			);

			await fs.remove(linkDir);
		} else if (!fs.existsSync(linkDir)) {
			console.log(
				chalk.green(`Copying build to ${chalk.blueBright(linkDir)}`)
			);
			await fs.symlink(path.resolve('./dist'), linkDir);
		}
		return Promise.resolve();
	} catch (err) {
		Promise.reject(err);
	}
}

/*********************/
/*		PACKAGE		 */
/*********************/

/**
 * Package build
 */
async function packageBuild() {
	const manifest = getManifest();

	return new Promise((resolve, reject) => {
		try {
			// Remove the package dir without doing anything else
			if (argv.clean || argv.c) {
				console.log(chalk.yellow('Removing all packaged files'));
				fs.removeSync('package');
				return;
			}

			// Ensure there is a directory to hold all the packaged versions
			fs.ensureDirSync('package');

			// Initialize the zip file
			const zipName = `${manifest.file.name}-v${manifest.file.version}.zip`;
			const zipFile = fs.createWriteStream(path.join('package', zipName));
			const zip = archiver('zip', { zlib: { level: 9 } });

			zipFile.on('close', () => {
				console.log(chalk.green(zip.pointer() + ' total bytes'));
				console.log(
					chalk.green(`Zip file ${zipName} has been written`)
				);
				return resolve();
			});

			zip.on('error', (err) => {
				throw err;
			});

			zip.pipe(zipFile);

			// Add the directory with the final code
			zip.directory('dist/', manifest.file.name);

			zip.finalize();
		} catch (err) {
			return reject(err);
		}
	});
}

/*********************/
/*		PACKAGE		 */
/*********************/

/**
 * Update version and URLs in the manifest JSON
 */
function updateManifest(cb) {
	const packageJson = fs.readJSONSync('package.json');
	const config = getConfig(),
		manifest = getManifest(),
		repoURL = config.repository;

	if (!config) cb(Error(chalk.red('foundryconfig.json not found')));
	if (!manifest) cb(Error(chalk.red('Manifest JSON not found')));
	if (!repoURL)
		cb(
			Error(
				chalk.red(
					'"repository" URL not configured in foundryconfig.json'
				)
			)
		);

	try {
		const version = argv.update || argv.u;

		/* Update version */

		const versionMatch = /^(\d{1,}).(\d{1,}).(\d{1,})$/;
		const currentVersion = manifest.file.version;
		let targetVersion = '';

		if (!version) {
			cb(Error('Missing version number'));
		}

		if (versionMatch.test(version)) {
			targetVersion = version;
		} else {
			targetVersion = currentVersion.replace(
				versionMatch,
				(substring, major, minor, patch) => {
					console.log(
						substring,
						Number(major) + 1,
						Number(minor) + 1,
						Number(patch) + 1
					);
					if (version === 'major') {
						return `${Number(major) + 1}.0.0`;
					} else if (version === 'minor') {
						return `${major}.${Number(minor) + 1}.0`;
					} else if (version === 'patch') {
						return `${major}.${minor}.${Number(patch) + 1}`;
					} else {
						return '';
					}
				}
			);
		}

		if (targetVersion === '') {
			return cb(Error(chalk.red('Error: Incorrect version arguments.')));
		}

		if (targetVersion === currentVersion) {
			return cb(
				Error(
					chalk.red(
						'Error: Target version is identical to current version.'
					)
				)
			);
		}
		console.log(`Updating version number to '${targetVersion}'`);

		packageJson.version = targetVersion;
		manifest.file.version = targetVersion;

		/* Update URLs */

		// manifest: GitHub Releases /latest asset — Foundry polls this URL to detect updates
		// download: version-pinned ZIP asset — prevents old installations from breaking
		manifest.file.url = repoURL;
		manifest.file.manifest = `${repoURL}/releases/latest/download/${manifest.name}`;
		manifest.file.download = `${repoURL}/releases/download/v${manifest.file.version}/${manifest.file.name}-v${manifest.file.version}.zip`;

		const prettyProjectJson = stringify(manifest.file, {
			maxLength: 35,
			indent: '\t',
		});

		fs.writeJSONSync('package.json', packageJson, { spaces: '\t' });
		fs.writeFileSync(
			path.join(manifest.root, manifest.name),
			prettyProjectJson,
			'utf8'
		);

		return cb();
	} catch (err) {
		cb(err);
	}
}

function gitAdd() {
	return gulp.src('package').pipe(git.add({ args: '--no-all' }));
}

function gitCommit() {
	return gulp.src('./*').pipe(
		git.commit(`v${getManifest().file.version}`, {
			args: '-a',
			disableAppendPaths: true,
		})
	);
}

function gitTag() {
	const manifest = getManifest();
	return git.tag(
		`v${manifest.file.version}`,
		`Updated to ${manifest.file.version}`,
		(err) => {
			if (err) throw err;
		}
	);
}

const execGit = gulp.series(gitAdd, gitCommit, gitTag);

const execBuild = gulp.parallel(buildTS, buildSASS, copyFiles);

exports.build = gulp.series(clean, execBuild);
exports.watch = buildWatch;
exports.clean = clean;
exports.link = linkUserData;
exports.package = packageBuild;
exports.update = updateManifest;
exports.publish = gulp.series(
	clean,
	updateManifest,
	execBuild,
	packageBuild,
	execGit
);
