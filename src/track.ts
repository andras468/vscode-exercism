import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { notDeepEqual } from 'assert';

export class TrackProvider implements vscode.TreeDataProvider<Node> {
	private _onDidChangeTreeData: vscode.EventEmitter<Node | undefined> = new vscode.EventEmitter<Node | undefined>();
	readonly onDidChangeTreeData: vscode.Event<Node | undefined> = this._onDidChangeTreeData.event;
    private rootPath: string;
    // private track: string;

	constructor() {
        this.rootPath = "C:/Exercism";
		// this.track = "csharp";
	
		console.log('Tracks provider constructor');

	}

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: Node): vscode.TreeItem {
		return element;
	}

	getChildren(element?: Node): Promise<Node[]> {
		console.log('Tracks provider gets children');

		// if (!this.workspaceRoot) {
		// 	vscode.window.showInformationMessage('No exercism information found');
		// 	return Promise.resolve([]);
		// }
		if (element) {
			if (element.nodeType === NodeType.Track) {
				return new Promise<Node[]>((resolve, reject) => {
					resolve(this.getExercisms(element.trackPath));
				});
				}
			else {
				return new Promise<Node[]>((resolve, reject) => {
					resolve([]);
				});
			}
		}
		else {
			return new Promise<Node[]>((resolve, reject) => {
				resolve(this.getTracks(this.rootPath));
			});
		}
 	}

	private getTracks(root: string): Node[] {
		let tracks: Node[] = [];

		if (this.pathExists(root)) {
			var folders = fs.readdirSync(root);

			folders.reduce(function(result, d) {
				if (fs.lstatSync(path.join(root, d)).isDirectory() && !d.startsWith('.')) {
					result.push(new Node(d, path.join(root, d), NodeType.Track, vscode.TreeItemCollapsibleState.Collapsed));
				}

				return result;
			}, tracks);

			console.log(tracks);

			return tracks;
		}

		return [];
	}

	private getExercisms(trackPath: string): Node[] {
		let exercisms: Node[] = [];

		if (this.pathExists(trackPath)) {
			var folders = fs.readdirSync(trackPath);
			const parseExercismJson = (path: string, node: Node) => this.parseExercismJson(path, node);
			folders.reduce(function(result, d) {
				const exercismPath: string = path.join(trackPath, d);

				if (fs.lstatSync(exercismPath).isDirectory() && !d.startsWith('.')) {
					// parseExercismJSon
					const node = new Node(d, trackPath, NodeType.Exercism, vscode.TreeItemCollapsibleState.None);
					parseExercismJson(exercismPath, node);

					result.push(node);
				}

				return result;
			}, exercisms);

			console.log(exercisms);

			return exercisms;
		}

		return [];
	}

	parseExercismJson(exercismPath: string, node: Node): void {
		const jsonPath = path.join(exercismPath, ".exercism/metadata.json");

		if (fs.existsSync(jsonPath)) {
			const json = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
			node.label = json.exercise;
			node.description = json.id;
		}
	}

	private pathExists(p: string): boolean {
		try {
			fs.accessSync(p);
		} catch (err) {
			return false;
		}

		return true;
	}
}

export enum NodeType {
	Track,
	Exercism
}

export class Node extends vscode.TreeItem {
	constructor(
        public label: string,
		public trackPath: string,
		public nodeType: NodeType,
		public collapsibleState: vscode.TreeItemCollapsibleState,
		public command?: vscode.Command
	) {
		super(label, collapsibleState);

		if (nodeType === NodeType.Exercism)
		{
			this.contextValue = 'exercism';
		}
		else
		{
			this.contextValue = 'track';
		}
	}

	get tooltip(): string {
		return `${this.label}`;
	}

	iconPath = {
		light: path.join(__filename, '..', '..', 'resources', 'light', this.nodeType === NodeType.Track ? 'dependency.svg' : 'document.svg'),
		dark: path.join(__filename, '..', '..', 'resources', 'dark', this.nodeType === NodeType.Track ? 'dependency.svg' : 'document.svg')
	};
}
