
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	type MatcherParam<M> = M extends (param : string) => param is (infer U extends string) ? U : string;

	export interface AppTypes {
		RouteId(): "/" | "/ideas" | "/projects" | "/projects/[id]" | "/projects/[id]/archive" | "/projects/[id]/boards" | "/projects/[id]/editor" | "/projects/[id]/editor/[did]" | "/projects/[id]/ideas" | "/projects/[id]/milestones" | "/projects/[id]/project-logs" | "/projects/[id]/tasks" | "/projects/[id]/updates";
		RouteParams(): {
			"/projects/[id]": { id: string };
			"/projects/[id]/archive": { id: string };
			"/projects/[id]/boards": { id: string };
			"/projects/[id]/editor": { id: string };
			"/projects/[id]/editor/[did]": { id: string; did: string };
			"/projects/[id]/ideas": { id: string };
			"/projects/[id]/milestones": { id: string };
			"/projects/[id]/project-logs": { id: string };
			"/projects/[id]/tasks": { id: string };
			"/projects/[id]/updates": { id: string }
		};
		LayoutParams(): {
			"/": { id?: string; did?: string };
			"/ideas": Record<string, never>;
			"/projects": { id?: string; did?: string };
			"/projects/[id]": { id: string; did?: string };
			"/projects/[id]/archive": { id: string };
			"/projects/[id]/boards": { id: string };
			"/projects/[id]/editor": { id: string; did?: string };
			"/projects/[id]/editor/[did]": { id: string; did: string };
			"/projects/[id]/ideas": { id: string };
			"/projects/[id]/milestones": { id: string };
			"/projects/[id]/project-logs": { id: string };
			"/projects/[id]/tasks": { id: string };
			"/projects/[id]/updates": { id: string }
		};
		Pathname(): "/" | "/ideas" | `/projects/${string}` & {} | `/projects/${string}/archive` & {} | `/projects/${string}/boards` & {} | `/projects/${string}/editor/${string}` & {} | `/projects/${string}/ideas` & {} | `/projects/${string}/milestones` & {} | `/projects/${string}/project-logs` & {} | `/projects/${string}/tasks` & {} | `/projects/${string}/updates` & {};
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): string & {};
	}
}