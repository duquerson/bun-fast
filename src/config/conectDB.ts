import mongoose from 'mongoose';
let isConnected = false;


//------------------------------------------------------------------------------
// Conexión a MongoDB 
//------------------------------------------------------------------------------

export const connect = (request: string): Promise<void> => {

	if (isConnected) {
		console.log('✅ MongoDB ya está conectado');
		return Promise.resolve();
	}

	const options = {
		maxPoolSize: 10,
		serverSelectionTimeoutMS: 5000,
		bufferCommands: false,
		retryWrites: true,
		retryReads: true,
	};


	return mongoose.connect(request, options)
		.then(() => {
			isConnected = true;
			console.log('✅ MongoDB conectado exitosamente');
		})
		.catch((error) => {
			isConnected = false;
			console.log('❌ Error conectando a MongoDB');
			throw error;
		});
};
