import Fastify from "fastify";
import { todoRoutes } from "./routes/todo.route.ts";
import { connect } from './config/conectDB.ts'
const app = Fastify({ logger: true });
import { DATA } from './utils/CONST.ts'
//----------------------------------------------------------

const port = 4321;
const host = DATA.HOST ?? 'localhost';
const URL = DATA.URL ?? 'mongodb://localhost:27017/todos';
//-----------------------------------------------------
app.register(todoRoutes, { prefix: "/api/v1/todos" });

app.setNotFoundHandler(async (request, reply) => {
	reply.status(404).send({ error: `Route ${request.url} not found` });
});

const start = async () => {
	try {
		await connect(URL);
		const address = await app.listen({ port, host });
		app.log.info(`Server running at ${address}`);
	} catch (err) {
		app.log.error(err);
		process.exit(1);
	}
};

start();
