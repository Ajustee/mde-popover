

export interface JsonObject
{
    [prop: string]: JsonValue;
}
export interface JsonArray extends Array<JsonValue> {}
export type JsonValue = string | number | boolean | JsonObject | JsonArray | null;

export interface AngularWorkspace
{
	version: number;
	cli?:
	{
		analytics?: boolean;
		packageManager?: string;
	};
	newProjectRoot: string;
	defaultProject?: string;
	projects?: Record<string, AngularProject>;

}

export interface AngularProject
{
	root?: string;
	sourceRoot?: string;
	projectType?: string;
	prefix?: string;
	architect?: AngularArchitect;
}

export interface AngularArchitect
{
	build?: AngularBuild;
	configurations?: unknown;
}

export interface AngularBuild
{
	builder?: string;
	options?: unknown | NgPackagrBuildOptions;
}

export interface NgPackagrBuildOptions
{
	project?: string;
	tsConfig?: string;
}

export const getProject = (ws: AngularWorkspace, projectName: string) =>
{
	const projects = ws.projects;
	if (!projects) throw new Error("Angular workspace does not contain any projects.");
	const project = projects[projectName];
	if (!project) throw new Error(`Angular workspace does not contain the project '${projectName}'.`);
	return project;
}

export const getProjectBuildOptions = (project: AngularProject, expectedBuilder: string) =>
{
	const architect = project.architect;
	if (!architect) throw new Error("The project does not contain the section 'architect'.");
	const build = architect.build;
	if (!build) throw new Error("The project does not contain the section 'architect.build'.");
	const builder = build.builder;
	if (!builder) throw new Error("The project does not contain a value for 'architect.build.builder'.");
	if (builder !== expectedBuilder) throw new Error(`The expected builder is '${expectedBuilder}', but actual is '${builder}'.`);
	return build.options;
}

export interface NgPackagrProject
{
	dest?: string,
	lib?:
	{
	  entryFile?: string;
	}
}
