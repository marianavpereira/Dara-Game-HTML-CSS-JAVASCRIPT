HeaderOptions = {
	'access-control-allow-origin': '*',
	'access-control-allow-methods': '*',
	'access-control-allow-headers': 'content-type, accept'
}; // headers para o método os metodos POST e OPTIONS


HeadersSSE = {
	'Content-Type': 'text/event-stream',
	'Cache-Control': 'no-cache',
	'Access-Control-Allow-Origin': '*',
	'Connection': 'keep-alive'
}; // headers para o método GET com SSE

users = {}; // dicionario para guardar os utilizadores registados

gameQueue = {
	'{"rows":5,"columns":6}': [],
	'{"rows":6,"columns":6}': []
}; // dicionario para guardar os jogos à espera de um adversário

gamesCreated = 0; // contador para os jogos criados, para criar ids diferentes para cada jogo

ingame = {}; //associa um game a dois nicks

gameUpdate = false;

notifyTimer = setTimeout(function () {}, 0); // timer para enviar notificações de jogos à espera de adversário