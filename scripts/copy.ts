import * as path from 'path';
import * as fs from 'fs';
import { AngularWorkspace, getProject, getProjectBuildOptions, NgPackagrBuildOptions, NgPackagrProject } from './AngularWorkspace';

const utf8Encoding = { encoding: 'utf8' };

interface NodeError extends Error
{
	code: string;
	errno: number;
	syscall?: string;
	path?: string;
}

const isNodeError = (error: unknown): error is NodeError => error instanceof Error && typeof((error as NodeError).code) == 'string'

const readFileHierarchyUp = (dirPath: string, fileName: string): [dirPath: string, content: string] =>
{
	while(true)
	{
		let filePath = path.join(dirPath, fileName);
		try
		{
			return [dirPath, fs.readFileSync(filePath, utf8Encoding)];
		}
		catch(error: unknown)
		{
			if (!isNodeError(error) || error.code !== 'ENOENT')  throw error;
		}
		let parent = path.dirname(dirPath);
		if (parent == dirPath) throw new Error(`The file ${fileName} is not found starting from `);
		dirPath = parent;
	}
}


const getNgPackagrProject = (): {angularWsDir: string, ngPackagrDir: string, ngPackagrProject: NgPackagrProject} =>
{
	const mainModule = require.main;
	if (!mainModule) throw new Error("Main module is undefined.");

	const [angularWsDir, angularWsContent] = readFileHierarchyUp(mainModule.path, "angular.json");
	const angularWs = JSON.parse(angularWsContent) as AngularWorkspace;
	const project = getProject(angularWs, 'lib-popover');
	const options = getProjectBuildOptions(project, '@angular-devkit/build-angular:ng-packagr') as NgPackagrBuildOptions;
	let ngPackagrProjectPath = options.project;
	if (!ngPackagrProjectPath) throw new Error('ng-packagr project is not specified.');
	ngPackagrProjectPath = path.join(angularWsDir, ngPackagrProjectPath);
	const ngPackagrProjectContent = fs.readFileSync(ngPackagrProjectPath, { encoding: 'utf-8' })
	return {
		angularWsDir,
		ngPackagrDir: path.dirname(ngPackagrProjectPath),
		ngPackagrProject: JSON.parse(ngPackagrProjectContent) as NgPackagrProject
	};
}

const {angularWsDir, ngPackagrDir, ngPackagrProject} = getNgPackagrProject();

let destDir = ngPackagrProject.dest;
if (!destDir) throw new Error('ng-packagr does not define dest dir.');
destDir = path.join(ngPackagrDir, destDir);

fs.copyFileSync(path.join(angularWsDir, 'README.md'), path.join(destDir, 'README.md'));

console.log('done.');
