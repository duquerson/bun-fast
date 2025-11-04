import mongoose from 'mongoose';
let isConnected = false;

export const connect = async (url: string): Promise<void> => {
	if (isConnected) {
		console.log('✅ MongoDB ya está conectado');
		return;
	}

	const options = {
		maxPoolSize: 10,
		serverSelectionTimeoutMS: 5000,
		bufferCommands: false,
		retryWrites: true,
		retryReads: true,
	};

	try {
		await mongoose.connect(url, options);
		isConnected = true;
		console.log('✅ MongoDB conectado exitosamente');
	} catch (error) {
		isConnected = false;
		console.log('❌ Error conectando a MongoDB');
		throw error;
	}
};
