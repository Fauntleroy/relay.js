# relay.js

### Kinder, Simpler IRC.

Relay.js is a web-based IRC client that focuses on making IRC less intimidating and easier to use.


### Demo: http://relayjs.jit.su


![0.0.1 Interface](https://s3-us-west-2.amazonaws.com/relayjs/relayjs_2-24-13.png)

## Features

- Simple, usability-driven interface
- Dynamic embedding of content ( links, images, Gists, YouTube videos )
- Support for multiple connections
- Emoticons ( via http://www.emoji-cheat-sheet.com/ )

## Upcoming Features

- Additional content embedding ( Vimeo, Tweets, Open Graph, etc )
- Rearrangeable, modular interface
- Interface elements for certain IRC commands, such as banning/kicking a user
- Tab completion for usernames, emoticons, certain commands
- Tests
- Persistent connections
- Logging

## Installation

- Install the latest version of [node.js](http://nodejs.org)
- Pull this repository
- Run `npm install` in the base directory
- Run `node relay.js`
- Navigate to [http://localhost:8080](http://localhost:8080)

If you plan on doing development, you'll want to install [Grunt](http://gruntjs.com/). Running `grunt dev` will build the assets (unminified), start the server, and watch + recompile the assets on change. A full list of grunt tasks can be seen with `grunt -h`.

## Configuration

Relay.js supports simple server configuration via `config.json`. As time goes on, more configuration options will be added. Presently, the following two parameters are supported:

* **max_connections** *integer* - The maximum number of connections that can be made from a single client.
* **preset_server** *object* - An object specifying a preset server to connect to. This limits the user to a single connection to just this server. Parameters are **host**, **port**, and **password**.
* **suggested_channels** *array* - An array of channels that populate the 'Channels' input on the connect dialog.

To set these options, just make a `config.json` in the main directory of the app. Here's a quick example:

```json
{
	"preset_server": {
		"host": "irc.freenode.net"
	},
	"suggested_channels": [
		"#relay.js"
	]
}
```

## Contributing

Contributing to Relay.js is simple: just create a fork, make a new branch, and submit a pull request when you're done. Try to keep your code style similar to the original and comment anything worth mentioning. Discussion is encouraged in issues and pull requests. Relay.js can be found in the channel #relay.js on Freenode.

## License

MIT License ( see LICENSE.md )
