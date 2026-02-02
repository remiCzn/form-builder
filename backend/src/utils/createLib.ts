const createLib = <T>(createLib: () => T, key: string) => {
	if (process.env.NODE_ENV === "production") {
		return createLib();
	}

	const globalWithLib = global as typeof globalThis & {
		[key]: T;
	};
	if (!globalWithLib[key]) {
		globalWithLib[key] = createLib();
	}
	return globalWithLib[key];
};

export default createLib;
