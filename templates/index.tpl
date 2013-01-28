<!DOCTYPE html>
<html>
<head>

	<title>IRCHUB</title>

	<meta name="viewport" content="width=device-width, initial-scale=1.0">

	<link rel="stylesheet" href="/styles/irc.css" />
	<script src="/socket.io/socket.io.js"></script>
	<script src="/templates/irc.js"></script>
	<script src="/scripts/irc.js"></script>

</head>
<body>

	<div id="connect"></div>

	<div id="application">
		<div id="user"></div>
		<div id="connections"></div>
		<div id="channel"></div>
	</div>

<script>document.write('<script src="http://' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1"></' + 'script>')</script>	

</body>
</html>