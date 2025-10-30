

// Schema for GET ALL
export const SchemaGetAll = {
	description: 'Obtiene todos los TODOs',
	tags: ['TODOs'],
	response: {
		200: {
			description: 'Lista de TODOs',
			type: 'object',
			properties: {
				success: { type: 'boolean' },
				data: {
					type: 'array',
					items: {
						type: 'object',
						properties: {
							id: { type: 'string' },
							description: { type: 'string' },
							completed: { type: 'boolean' }
						}
					}
				}
			}
		}
	}
} as const;

// Schema for GET by ID
export const SchemaID = {
	description: 'Obtiene un TODO por su ID',
	tags: ['TODOs'],
	params: {
		type: 'object',
		properties: {
			id: {
				type: 'string',
				minLength: 1,
				description: 'ID del TODO'
			}
		},
		required: ['id'],
		additionalProperties: false
	},
	response: {
		200: {
			description: 'TODO encontrado',
			type: 'object',
			properties: {
				success: { type: 'boolean' },
				data: {
					type: 'object',
					properties: {
						id: { type: 'string' },
						description: { type: 'string' },
						completed: { type: 'boolean' }
					}
				}
			}
		},
		404: {
			description: 'TODO no encontrado',
			type: 'object',
			properties: {
				error: { type: 'string' }
			}
		}
	}
} as const;

// Schema for POST (crea TODO)
export const SchemaBODY = {
	description: 'Crea un nuevo TODO',
	tags: ['TODOs'],
	body: {
		type: 'object',
		properties: {
			description: {
				type: 'string',
				minLength: 1,
				maxLength: 500,
				description: 'Descripción de la tarea'
			},
			completed: {
				type: 'boolean',
				description: 'Estado de completado'
			}
		},
		required: ['description', 'completed'],
		additionalProperties: false,
	},
	response: {
		201: {
			description: 'TODO creado exitosamente',
			type: 'object',
			properties: {
				success: { type: 'boolean' },
				message: { type: 'string' },
				data: {
					type: 'object',
					properties: {
						id: { type: 'string' },
						description: { type: 'string' },
						completed: { type: 'boolean' }
					}
				}
			}
		},
		400: {
			description: 'Datos inválidos',
			type: 'object',
			properties: {
				error: { type: 'string' }
			}
		}
	}
} as const;

// Schema for PUT (update all todo)
export const SchemaUpdateTodo = {
	description: 'Actualiza un TODO existente',
	tags: ['TODOs'],
	params: {
		type: 'object',
		properties: {
			id: {
				type: 'string',
				minLength: 1,
				description: 'ID del TODO a actualizar'
			}
		},
		required: ['id'],
		additionalProperties: false
	},
	body: {
		type: 'object',
		properties: {
			description: {
				type: 'string',
				minLength: 1,
				maxLength: 500,
				description: 'Nueva descripción de la tarea'
			},
			completed: {
				type: 'boolean',
				description: 'Nuevo estado de completado'
			}
		},
		required: ['description', 'completed'],
		additionalProperties: false,
	},
	response: {
		200: {
			description: 'TODO actualizado exitosamente',
			type: 'object',
			properties: {
				success: { type: 'boolean' },
				message: { type: 'string' },
				data: {
					type: 'object',
					properties: {
						id: { type: 'string' },
						description: { type: 'string' },
						completed: { type: 'boolean' }
					}
				}
			}
		},
		404: {
			description: 'TODO no encontrado',
			type: 'object',
			properties: {
				error: { type: 'string' }
			}
		},
		400: {
			description: 'Datos inválidos',
			type: 'object',
			properties: {
				error: { type: 'string' }
			}
		}
	}
} as const;

// Schema for PATCH (update only completed)
export const SchemaCompletion = {
	description: 'Actualiza el estado de completado de un TODO',
	tags: ['TODOs'],
	params: {
		type: 'object',
		properties: {
			id: {
				type: 'string',
				minLength: 1,
				description: 'ID del TODO'
			}
		},
		required: ['id'],
		additionalProperties: false
	},
	body: {
		type: 'object',
		properties: {
			completed: {
				type: 'boolean',
				description: 'Nuevo estado de completado'
			}
		},
		required: ['completed'],
		additionalProperties: false
	},
	response: {
		200: {
			description: 'Estado actualizado exitosamente',
			type: 'object',
			properties: {
				success: { type: 'boolean' },
				message: { type: 'string' },
				data: {
					type: 'object',
					properties: {
						id: { type: 'string' },
						description: { type: 'string' },
						completed: { type: 'boolean' }
					}
				}
			}
		},
		404: {
			description: 'TODO no encontrado',
			type: 'object',
			properties: {
				error: { type: 'string' }
			}
		}
	}
} as const;

// Schema for DELETE
export const SchemaDelete = {
	description: 'Elimina un TODO',
	tags: ['TODOs'],
	params: {
		type: 'object',
		properties: {
			id: {
				type: 'string',
				minLength: 1,
				description: 'ID del TODO a eliminar'
			}
		},
		required: ['id'],
		additionalProperties: false
	},
	response: {
		204: {
			description: 'TODO eliminado exitosamente (sin contenido)',
			type: 'null'
		},
		404: {
			description: 'TODO no encontrado',
			type: 'object',
			properties: {
				error: { type: 'string' }
			}
		}
	}
} as const;

// Schema for Health
export const SchemaHealth = {
	description: 'Health check completed of system',
	tags: ['System'],
	response: {
		200: {
			description: 'system stats',
			type: 'object',
			properties: {
				status: { type: 'string' },
				timestamp: { type: 'string' },
				uptime: { type: 'number' },
				environment: { type: 'string' },
			}
		}
	}
} as const;
