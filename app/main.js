import app from 'app';
import BrowserWindow from 'browser-window';

const MAIN_WINDOW_HTML_PATH = 'file://'+ __dirname +'/index.html';

var mainWindow;

app.on('ready', function(){
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600
    });

    mainWindow.loadUrl( MAIN_WINDOW_HTML_PATH );
});