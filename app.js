#!/usr/bin/env node

var KodiController = require('kodi-controller');
var fs = require('fs');
var fspath = require('path');
var ini = require('ini');
var os = require('os');
var program = require('commander');
require('commander-extras');
var promisify = require('util').promisify;

var kodi; // Will be populated by the active kodi-controller when it loads

program
	.version(require('./package.json').version)
	.name('kodi-cmd')
	.usage('[arguments]')
	.option('--pause', 'Pause the player')
	.option('--play', 'Play the player')
	.option('--playPause', 'Toggle play / pause')
	.option('--stop', 'Stop the player')
	.option('--volume-up', 'Increase the volume (set --volume-step to control the percentage)')
	.option('--volume-down', 'Decrease the volume (set --volume-step to control the percentage)')
	.option('--fast-forward', 'Begin fast-forward mode (set --seek-speed control the speed)')
	.option('--rewind', 'Begin rewind mode (set --seek-speed control the speed)')
	.option('--context-menu', 'Display the context-menu')
	.option('--select', 'Send the "select" button press')
	.option('--back', 'Send the "back" button press')
	.option('--home', 'Send the "home" button press')
	.option('--next', 'Send the "next" button press')
	.option('--previous', 'Send the "previous" button press')
	.option('--move-up', 'Send the "move-up" button press')
	.option('--move-down', 'Send the "move-down" button press')
	.option('--move-left', 'Send the "move-left" button press')
	.option('--move-right', 'Send the "move-right" button press')
	.option('--toggle-fullscreen', 'Toggle the players full-screen mode')
	.option('--toggle-mute', 'Toggle the players mute mode')
	.option('--toggle-shuffle', 'Toggle the players shuffle mode')
	.option('--volume-step <percent>', 'Set the volume to increase / decrease by', 5)
	.option('--seek-speed <2|4|8|16|32>', 'Multiplier when using rewind / fast-fowards', '2')
	.option('--host <address>', 'Set the hostname to use')
	.option('--port <port>', 'Set the port to use', 8080)
	.option('-v, --verbose', 'Be verbose, specify multiple times for more verbosity', (t, v) => v++, 0)
	.note('The INI file ~/.kodi-cmd can populate "host", "port", "seekSpeed", "volumeStep" and "verbose" options')
	.parse(process.argv)

return Promise.resolve()
	// Read INI file if its available {{{
	.then(()=> fs.promises.readFile(fspath.join(os.homedir(), '.kodi-cmd'), 'utf-8')
		.then(contents => {
			if (program.verbose > 1) console.log('Found INI file');
			return ini.parse(contents)
		})
		.then(config => {
			if (!program.host && config.host) program.host = config.host;
			if (!program.port && config.port) program.port = config.port;
			if (config.seekSpeed) program.seekSpeed = config.seekSpeed;
			if (config.volumeStep) program.volumeStep = config.volumeStep;
			if (config.verbose) program.verbose = parseInt(config.verbose || 0);
		})
		.catch(()=> program.verbose > 1 && console.log('No INI file present')) // Can't find / read the INI file - ignore
	)
	// }}}
	// Sanity checks {{{
	.then(()=> {
		if (!program.host) throw new Error('No host specified, either use --host or create one in the INI file');
		if (!program.port) throw new Error('Port cannot be empty');

		program.seekSpeed = parseInt(program.seekSpeed);
		if (!program.seekSpeed || ![2, 4, 8, 16, 32].includes(program.seekSpeed)) throw new Error(`Seek speed must be 2, 4, 8, 16 or 32, given "${program.seekSpeed}"`);

		program.volumeStep = parseInt(program.volumeStep);
		if (program.volumeStep < 1 || program.volumeStep > 100) throw new Error(`Volume step must be between 1 and 100, given "${program.volumeStep}"`);
	})
	// }}}
	// Connect {{{
	.then(()=> program.verbose && console.log(`Connecting to Kodi host "${program.host}:${program.port}"`))
	.then(()=> kodi = new KodiController(program.host, program.port))
	// }}}
	// Promisify the controller {{{
	.then(()=> {
		// Regular callback order
		[
			'getActivePlayerID',
			'pause', 'play', 'playPause', 'stop',
			'contextMenu', 'select',
			'goBack', 'goHome', 'goNext', 'goPrevious',
			'goUp', 'goDown', 'goLeft', 'goRight',
			'toggleFullscreen', 'toggleMute', 'toggleShuffle',
		].forEach(k => kodi[k] = promisify(kodi[k]))

		// Deal with the somewhat odd order of callbacks for some commands
		// BUGFIX: Not yet supported - see https://github.com/CMP2804M-Group3/kodi-controller/issues/85
		/*
		['volumeDown', 'volumeUp', 'rewind', 'fastForward', 'setVolume']
			.forEach(k => kodi[k] = new Promise((resolve, reject) =>
				kodi[k].bind(this, (err, val) => err ? reject(err) : resolve(val))
			))
		*/
	})
	// }}}
	// Check connection is valid {{{
	.then(()=> new Promise((resolve, reject) => {
		// BUGFIX: Hacky work around to handle weird responses from upstream when host is invalid - see https://github.com/CMP2804M-Group3/kodi-controller/issues/86
		var domain = require('domain').create();
		domain.on('error', e => reject(`Unable to connect to Kodi player @ "${program.host}:${program.port}"`));
		domain.run(()=> kodi.getActivePlayerID())
	}))
	// }}}
	// Perform commands {{{
	.then(()=> Promise.all([
		program.pause && kodi.pause(),
		program.play && kodi.play(),
		program.playPause && kodi.playPause(),
		program.stop && kodi.stop(),
		program.volumeDown && kodi.volumeDown(program.volumeStep),
		program.volumeUp && kodi.volumeDown(program.volumeStep),
		program.fastForward && kodi.fastForward(),
		program.rewind && kodi.rewind(),
		program.contextMenu && kodi.contextMenu(),
		program.select && kodi.select(),
		program.back && kodi.goBack(),
		program.home && kodi.goHome(),
		program.next && kodi.goNext(),
		program.previous && kodi.goPrevious(),
		program.moveUp && kodi.goUp(),
		program.moveDown && kodi.goDown(),
		program.moveLeft && kodi.goLeft(),
		program.moveRight && kodi.goRight(),
		program.toggleFullScreen && kodi.toggleFullscreen(),
		program.toggleMute && kodi.toggleMute(),
		program.toggleShuffle && kodi.toggleShuffle(),
	]))
	.then(()=> program.verbose && console.log('Done'))
	.catch(e => {
		console.warn(e.toString());
		process.exit(1);
	})
	// }}}
