module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	fakeTimers: { enableGlobally: true },
	moduleNameMapper: {
		"^@spi/(.*)$": "<rootDir>/$1",
		"^@repo/infra/(.*)$": "<rootDir>/../../packages/infra/$1",
	},
	testMatch: ['**/*.test.ts'],
};
