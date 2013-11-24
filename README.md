# relay.js

### Kinder, Simpler IRC.

Relay.js is a web-based IRC client that focuses on making IRC less intimidating and easier to use.


### Demo: http://demo.relayjs.com

* *This is only a demonstration server. It may break, crash, or stall at any time without warning. It's highly recommended that you host your own instance of Relay.js for prolonged use.*

![0.0.1 Interface](https://s3-us-west-2.amazonaws.com/relayjs/relayjs_2-24-13.png)

## Features

- Simple, usability-driven interface
- Dynamic embedding of content ( links, images, Gists, YouTube videos )
- Support for multiple connections
- Emoticons ( via http://www.emoji-cheat-sheet.com/ )

## Upcoming Features

- Additional content embedding ( Tweets, Codepen, Open Graph, etc )
- Rearrangeable, modular interface
- Interface elements for certain IRC commands, such as banning/kicking a user
- Tab completion for usernames, emoticons, certain commands
- Tests
- ~~Persistent connections~~ (persistent connections should be handled by some kind of [bouncer](https://www.ircrelay.com/))
- Logging

## Installation

- Install the latest version of [node.js](http://nodejs.org)
- Pull this repository
- Run `npm install` in the base directory
- Run `node relay.js`
- Navigate to [http://localhost:8080](http://localhost:8080)

If you plan on doing development, you'll want to install [Grunt](http://gruntjs.com/). Running `grunt dev` (or `npm run dev` if you don't have/want Grunt globally installed) will build the assets (unminified), start the server, and watch + recompile the assets on change. A full list of grunt tasks can be seen with `grunt -h`.

## Configuration

Relay.js supports simple server configuration via `config.js` and URL parameters. The `config.js` file must simply export a javascript object with the desired properties filled in. Current configuration options are as follows:

* **defaults** *object* - A set of default options to use on initial load. Includes **server** and **channels**.
* **defaults.server** *object* - An object specifying a preset server to connect to. If **locked** is set to `true`, these settings cannot be overridden, and by default the user is limited to a single connection. Parameters are **host**, **port**, **ssl**, and **password**.
* **defaults.nick** *string* - A nick that auto populates the 'Nick' input in the connect dialog.
* **defaults.channels** *array* - An array of channels that populate the 'Channels' input on the connect dialog.
* **max_connections** *integer* - The maximum number of connections that can be made from a single client. When `defaults.server.locked` is set, this will default to **1**.

To set these options, just make a `config.js` in the main directory of the app. Here's a quick example:

```js
module.exports = {
	"defaults": {
		"server": {
			"host": "irc.freenode.net"
		},
		"channels": [
			"#relay.js"
		]
	},
	"max_connections": 3
}
```

Some defaults may also be set using URL parameters. Defaults specified in the URL will override those in `config.js`, except for locked parameters. The following parameters are available:

* **server** - The URL of an IRC server (ex: "irc.freenode.net"). Maps to **defaults.server.host**. 
* **port** - The port of an IRC server (ex: 9001). Maps to **defaults.server.port**.
* **ssl** - Connect with SSL (ex: true). Maps to **defaults.server.ssl**.
* **nick** - The default nick to connect with (ex: "Fauntleroy"). Maps to **defaults.nick**.
* **channels** - A comma separated list of channels to join (ex: "relay.js,tksync"). Maps to **defaults.channels**.

## Contributing

Contributing to Relay.js is simple: just create a fork, make a new branch, and submit a pull request when you're done. Try to keep your code style similar to the original and comment anything worth mentioning. Discussion is encouraged in issues and pull requests. Relay.js can be found in the channel #relay.js on Freenode.

## License

MIT License ( see LICENSE.md )
