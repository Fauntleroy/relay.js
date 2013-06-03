// Set up the namespace
var irc = this.irc = this.irc || {};
irc.Models = irc.Models || {};
irc.Collections = irc.Collections || {};
irc.Routers = irc.Routers || {};
irc.Views = irc.Views || {};
irc.views = irc.views || {};
irc.routers = irc.routers || {};
irc.util = irc.util || {
	postprocessors: {}
};

var CDN_URL = 'https://s3-us-west-2.amazonaws.com/relayjs/';