//const { createDefaultPreset } = require("ts-jest");
import { createDefaultPreset } from 'ts-jest';
const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
export default {
	testEnvironment: 'node',
	transform: {
		'^.+\\.tsx?$': [
			'ts-jest',
			{
				tsconfig: 'tsconfig.node.json',
			},
		],
	},
};
