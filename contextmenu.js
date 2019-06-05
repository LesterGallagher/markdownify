const {app, BrowserWindow} = require('electron');
const contextMenu = require('electron-context-menu');

contextMenu({
	// prepend: (defaultActions, params, browserWindow) => [{
	// 	label: 'Rainbow',
	// 	// Only show it when right-clicking images
	// 	visible: params.mediaType === 'image'
	// }]
});
