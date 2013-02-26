<!DOCTYPE html>
<html>
<head>

	<title>relay.js</title>

	<meta name="viewport" content="width=device-width, initial-scale=1.0">

	<link href="//fonts.googleapis.com/css?family=Roboto:400,100,100italic,300italic,300,400italic,500,500italic,700,700italic,900,900italic" rel="stylesheet" type="text/css" />
	<link rel="stylesheet" href="/styles/irc.css" />

	<script>{{{javascript}}}</script>
	<script src="/socket.io/socket.io.js"></script>
	<script src="/templates/irc.js"></script>
	<script src="/scripts/irc.js"></script>

</head>
<body>

	<div id="connect"></div>

	<div id="application">
		<div id="logo">
			<h1>relay.js</h1>
			<sub title="alpha">α</sub>
		</div>
		<div id="connections"></div>
		<div id="channel"></div>
		<div id="notifications"></div>
	</div>

</body>
</html>