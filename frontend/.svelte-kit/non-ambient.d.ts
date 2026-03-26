
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
		RouteId(): "/(editor)" | "/(app)" | "/" | "/(app)/dashboard" | "/(app)/ideas" | "/login" | "/(editor)/projects" | "/(app)/projects" | "/(editor)/projects/[id]" | "/(app)/projects/[id]" | "/(app)/projects/[id]/archive" | "/(app)/projects/[id]/boards" | "/(editor)/projects/[id]/editor" | "/(editor)/projects/[id]/editor/[did]" | "/(app)/projects/[id]/ideas" | "/(app)/projects/[id]/milestones" | "/(app)/projects/[id]/project-logs" | "/(app)/projects/[id]/settings" | "/(app)/projects/[id]/tasks" | "/(app)/projects/[id]/updates" | "/register";
		RouteParams(): {
			"/(editor)/projects/[id]": { id: string };
			"/(app)/projects/[id]": { id: string };
			"/(app)/projects/[id]/archive": { id: string };
			"/(app)/projects/[id]/boards": { id: string };
			"/(editor)/projects/[id]/editor": { id: string };
			"/(editor)/projects/[id]/editor/[did]": { id: string; did: string };
			"/(app)/projects/[id]/ideas": { id: string };
			"/(app)/projects/[id]/milestones": { id: string };
			"/(app)/projects/[id]/project-logs": { id: string };
			"/(app)/projects/[id]/settings": { id: string };
			"/(app)/projects/[id]/tasks": { id: string };
			"/(app)/projects/[id]/updates": { id: string }
		};
		LayoutParams(): {
			"/(editor)": { id?: string; did?: string };
			"/(app)": { id?: string };
			"/": { id?: string; did?: string };
			"/(app)/dashboard": Record<string, never>;
			"/(app)/ideas": Record<string, never>;
			"/login": Record<string, never>;
			"/(editor)/projects": { id?: string; did?: string };
			"/(app)/projects": { id?: string };
			"/(editor)/projects/[id]": { id: string; did?: string };
			"/(app)/projects/[id]": { id: string };
			"/(app)/projects/[id]/archive": { id: string };
			"/(app)/projects/[id]/boards": { id: string };
			"/(editor)/projects/[id]/editor": { id: string; did?: string };
			"/(editor)/projects/[id]/editor/[did]": { id: string; did: string };
			"/(app)/projects/[id]/ideas": { id: string };
			"/(app)/projects/[id]/milestones": { id: string };
			"/(app)/projects/[id]/project-logs": { id: string };
			"/(app)/projects/[id]/settings": { id: string };
			"/(app)/projects/[id]/tasks": { id: string };
			"/(app)/projects/[id]/updates": { id: string };
			"/register": Record<string, never>
		};
		Pathname(): "/" | "/ideas" | `/projects/${string}` & {} | `/projects/${string}/archive` & {} | `/projects/${string}/boards` & {} | `/projects/${string}/editor/${string}` & {} | `/projects/${string}/ideas` & {} | `/projects/${string}/milestones` & {} | `/projects/${string}/project-logs` & {} | `/projects/${string}/tasks` & {} | `/projects/${string}/updates` & {};
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): string & {};
	}
}