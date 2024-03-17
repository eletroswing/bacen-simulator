module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	moduleNameMapper: {
		"^@api/(.*)$": "<rootDir>/$1",
		"^@repo/infra/(.*)$": "<rootDir>/../../packages/infra/$1",
		
	},
	testMatch: ['**/*.test.ts'],
};
