
export const DATA = {
	URL: process.env.APIMONGODB?.trim() || 'mongodb://localhost:27017/todos',
	PORT: process.env.PORT,
	HOST: process.env.HOST,
} as const;