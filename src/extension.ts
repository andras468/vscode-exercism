// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { TrackProvider, Node } from './track';
import { Uri } from 'vscode';
import * as path from 'path';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "exercismextension" is now active!');

	let disposable = vscode.commands.registerCommand('extension.exercism', () => {
		vscode.window.showInformationMessage('Hello Exercism World!');
	});

	const tracksProvider = new TrackProvider();
	vscode.window.registerTreeDataProvider('exercismExplorer', tracksProvider);
	vscode.commands.registerCommand('exercismExplorer.refreshTracks', () => tracksProvider.refresh());
	vscode.commands.registerCommand('exercismExplorer.openExercism', exercism =>  
		vscode.commands.executeCommand('vscode.openFolder', 
			Uri.file(path.join(exercism.trackPath, exercism.label))));

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
