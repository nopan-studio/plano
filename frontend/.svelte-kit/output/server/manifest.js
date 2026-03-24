export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set([]),
	mimeTypes: {},
	_: {
		client: {start:"_app/immutable/entry/start.TY2ZDODd.js",app:"_app/immutable/entry/app.CijYA6KB.js",imports:["_app/immutable/entry/start.TY2ZDODd.js","_app/immutable/chunks/LA9Hw9Ku.js","_app/immutable/chunks/BSm2jvCp.js","_app/immutable/chunks/DsXaVp1b.js","_app/immutable/chunks/B2xa8Jvx.js","_app/immutable/entry/app.CijYA6KB.js","_app/immutable/chunks/BSm2jvCp.js","_app/immutable/chunks/BYEUxnYd.js","_app/immutable/chunks/C0GInczg.js","_app/immutable/chunks/B2xa8Jvx.js","_app/immutable/chunks/Dwrf8mUj.js","_app/immutable/chunks/Dk6IBPrv.js","_app/immutable/chunks/BOscoz6C.js","_app/immutable/chunks/z-mEoTOA.js","_app/immutable/chunks/CEmIv-Kz.js","_app/immutable/chunks/DsXaVp1b.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js')),
			__memo(() => import('./nodes/4.js')),
			__memo(() => import('./nodes/5.js')),
			__memo(() => import('./nodes/6.js')),
			__memo(() => import('./nodes/7.js')),
			__memo(() => import('./nodes/8.js')),
			__memo(() => import('./nodes/9.js')),
			__memo(() => import('./nodes/10.js')),
			__memo(() => import('./nodes/11.js')),
			__memo(() => import('./nodes/12.js')),
			__memo(() => import('./nodes/13.js')),
			__memo(() => import('./nodes/14.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/(app)",
				pattern: /^\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 4 },
				endpoint: null
			},
			{
				id: "/(app)/ideas",
				pattern: /^\/ideas\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 5 },
				endpoint: null
			},
			{
				id: "/(app)/projects/[id]",
				pattern: /^\/projects\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,2,], errors: [1,,], leaf: 6 },
				endpoint: null
			},
			{
				id: "/(app)/projects/[id]/archive",
				pattern: /^\/projects\/([^/]+?)\/archive\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,2,], errors: [1,,], leaf: 7 },
				endpoint: null
			},
			{
				id: "/(app)/projects/[id]/boards",
				pattern: /^\/projects\/([^/]+?)\/boards\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,2,], errors: [1,,], leaf: 8 },
				endpoint: null
			},
			{
				id: "/(editor)/projects/[id]/editor/[did]",
				pattern: /^\/projects\/([^/]+?)\/editor\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false},{"name":"did","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,3,], errors: [1,,], leaf: 14 },
				endpoint: null
			},
			{
				id: "/(app)/projects/[id]/ideas",
				pattern: /^\/projects\/([^/]+?)\/ideas\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,2,], errors: [1,,], leaf: 9 },
				endpoint: null
			},
			{
				id: "/(app)/projects/[id]/milestones",
				pattern: /^\/projects\/([^/]+?)\/milestones\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,2,], errors: [1,,], leaf: 10 },
				endpoint: null
			},
			{
				id: "/(app)/projects/[id]/project-logs",
				pattern: /^\/projects\/([^/]+?)\/project-logs\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,2,], errors: [1,,], leaf: 11 },
				endpoint: null
			},
			{
				id: "/(app)/projects/[id]/tasks",
				pattern: /^\/projects\/([^/]+?)\/tasks\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,2,], errors: [1,,], leaf: 12 },
				endpoint: null
			},
			{
				id: "/(app)/projects/[id]/updates",
				pattern: /^\/projects\/([^/]+?)\/updates\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,2,], errors: [1,,], leaf: 13 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
