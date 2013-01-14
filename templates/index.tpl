<!DOCTYPE html>
<html>
<head>

	<title>IRCHUB</title>

	<meta name="viewport" content="width=device-width, initial-scale=1.0">

	<link rel="stylesheet" href="/styles/irc.css" />
	<script src="/socket.io/socket.io.js"></script>
	<script src="/templates/irc.js"></script>
	<script src="/scripts/irc.js"></script>
	<script src="/scripts/vendor/igneous/live.js"></script>
	<script>
		igneous.watch('/styles/irc.css');
	</script>

</head>
<body>

	<div id="connect"></div>

	<div id="application">
		<div id="user"></div>
		<div id="connections"></div>
		<div id="channel"></div>
	</div>

</body>
</html>