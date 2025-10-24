import { createDefaultPreset } from 'ts-jest';
const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
export default {
	extensionsToTreatAsEsm: ['.ts'],
	transform: {
		'^.+\\.tsx?$': [
			'ts-jest',
			{
				tsconfig: 'tsconfig.json',
				useESM: true,
			},
		],
	},
	globals: {
		'ts-jest': {
			useESM: true,
		},
	},
	transformIgnorePatterns: ['/node_modules/'],
	testEnvironment: 'node',
};
