export { matchers } from './matchers.js';

export const nodes = [
	() => import('./nodes/0'),
	() => import('./nodes/1'),
	() => import('./nodes/2'),
	() => import('./nodes/3'),
	() => import('./nodes/4'),
	() => import('./nodes/5'),
	() => import('./nodes/6'),
	() => import('./nodes/7'),
	() => import('./nodes/8'),
	() => import('./nodes/9'),
	() => import('./nodes/10'),
	() => import('./nodes/11'),
	() => import('./nodes/12'),
	() => import('./nodes/13'),
	() => import('./nodes/14')
];

export const server_loads = [];

export const dictionary = {
		"/(app)": [4,[2]],
		"/(app)/ideas": [5,[2]],
		"/(app)/projects/[id]": [6,[2]],
		"/(app)/projects/[id]/archive": [7,[2]],
		"/(app)/projects/[id]/boards": [8,[2]],
		"/(editor)/projects/[id]/editor/[did]": [14,[3]],
		"/(app)/projects/[id]/ideas": [9,[2]],
		"/(app)/projects/[id]/milestones": [10,[2]],
		"/(app)/projects/[id]/project-logs": [11,[2]],
		"/(app)/projects/[id]/tasks": [12,[2]],
		"/(app)/projects/[id]/updates": [13,[2]]
	};

export const hooks = {
	handleError: (({ error }) => { console.error(error) }),
	
	reroute: (() => {}),
	transport: {}
};

export const decoders = Object.fromEntries(Object.entries(hooks.transport).map(([k, v]) => [k, v.decode]));
export const encoders = Object.fromEntries(Object.entries(hooks.transport).map(([k, v]) => [k, v.encode]));

export const hash = false;

export const decode = (type, value) => decoders[type](value);

export { default as root } from '../root.js';