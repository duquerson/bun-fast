import Fastify from "fastify";
import { todoRoutes } from "./routes/todo.route.ts";
import { connect } from './config/conectDB.ts';
const app = Fastify({ logger: true });
import { DATA } from './utils/CONST.ts';
import { registerErrorHandler } from "./helpers/registerErrorHandler.ts";
//----------------------------------------------------------
//const
//---------------------------------------------------------
const port = 4321;
const host = DATA.HOST ?? 'localhost';
const URL = DATA.URL ?? 'http://localhost:27017/todos';
//-----------------------------------------------------
//routers
//-----------------------------------------------------
app.register(todoRoutes, { prefix: "/api/v1/todos" });
//------------------------------------------------------
//handlers routes and errors
//------------------------------------------------------
app.setNotFoundHandler(async (request, reply) => {
	reply.status(404).send({ error: `Route ${request.url} not found` });
});

registerErrorHandler(app);

//------------------------------------------------------
//start services
//-----------------------------------------------------
const start = async () => {
	try {
		await connect(URL);
		await app.listen({ port, host });
	} catch (err) {
		app.log.error(err);
		process.exit(1);
	}
};
start();
