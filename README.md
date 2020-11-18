kodi-controller-cli
===================
Control Kodi from the command line.

This project is a command line wrapper for the excellent [kodi-controller](https://github.com/CMP2804M-Group3/kodi-controller) module.

**Features**:

* Simple CLI interface to quickly command a remote Kodi box
* Send multiple commands at once
* Configurable volume / speed steps
* INI file to configure common host/port and other settings


Installation
------------
Install via NPM in the usual way:

```
npm i -g kodi-controller-cli
```

(You may need a `sudo` prefix depending on your Node setup)


Usage
-----
```
Usage: kodi-cmd [arguments]

Options:
  -V, --version               output the version number
  --pause                     Pause the player
  --play                      Play the player
  --play-pause                Toggle play / pause
  --stop                      Stop the player
  --volume-up                 Increase the volume (set --volume-step to control
                              the percentage)
  --volume-down               Decrease the volume (set --volume-step to control
                              the percentage)
  --fast-forward              Begin fast-forward mode (set --seek-speed control
                              the speed)
  --rewind                    Begin rewind mode (set --seek-speed control the
                              speed)
  --context-menu              Display the context-menu
  --select                    Send the "select" button press
  --back                      Send the "back" button press
  --home                      Send the "home" button press
  --next                      Send the "next" button press
  --previous                  Send the "previous" button press
  --move-up                   Send the "move-up" button press
  --move-down                 Send the "move-down" button press
  --move-left                 Send the "move-left" button press
  --move-right                Send the "move-right" button press
  --toggle-fullscreen         Toggle the players full-screen mode
  --toggle-mute               Toggle the players mute mode
  --toggle-shuffle            Toggle the players shuffle mode
  --repeat-off                Turn the players repeat mode off
	--repeat-one                Turn the players repeat mode on for the current track
	--repeat-all                Turn the players repeat mode on for all tracks
	--shutdown                  Shutdown kodi and the machine running it
	--reboot                    Reboot kodi and the machine
  --volume-step <percent>     Set the volume to increase / decrease by
                              (default: 5)
  --seek-speed <2|4|8|16|32>  Multiplier when using rewind / fast-forwards
                              (default: "2")
  --host <address>            Set the hostname to use
  --port <port>               Set the port to use (default: 8080)
  --ping                      State if the player is contactable
  -v, --verbose               Be verbose, specify multiple times for more
                              verbosity
  -h, --help                  display help for command

Notes:
  * The INI file ~/.kodi-cmd can populate "host", "port", "seekSpeed", "volumeStep" and "verbose" options
```
