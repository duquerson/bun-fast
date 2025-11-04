// Schema for GET ALL
export const SchemaGetAll = {
	description: 'Get all TODOs',
	tags: ['TODOs'],
	querystring: {
		type: 'object',
		properties: {
			limit: {
				type: 'integer',
				minimum: 1,
				maximum: 1000,
				default: 100,
				description: 'Maximum number of todos to return'
			}
		}
	},
	response: {
		200: {
			description: 'List of TODOs',
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
	description: 'Get a TODO by ID',
	tags: ['TODOs'],
	params: {
		type: 'object',
		properties: {
			id: {
				type: 'string',
				minLength: 1,
				pattern: '^[0-9a-fA-F]{24}$',
				description: 'Unique identifier'
			}
		},
		required: ['id'],
		additionalProperties: false
	},
	response: {
		200: {
			description: 'TODO found',
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
			description: 'TODO not found',
			type: 'object',
			properties: {
				error: { type: 'string' }
			}
		}
	}
} as const;

// Schema for POST (create TODO)
export const SchemaBODY = {
	description: 'Create a new TODO',
	tags: ['TODOs'],
	body: {
		type: 'object',
		properties: {
			description: {
				type: 'string',
				minLength: 1,
				maxLength: 2000,
				description: 'Task description'
			},
			completed: {
				type: 'boolean',
				description: 'Completion status'
			}
		},
		required: ['description', 'completed'],
		additionalProperties: false,
	},
	response: {
		201: {
			description: 'TODO created successfully',
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
			description: 'Invalid data',
			type: 'object',
			properties: {
				error: { type: 'string' }
			}
		}
	}
} as const;

// Schema for PUT (update all todo)
export const SchemaUpdateTodo = {
	description: 'Update an existing TODO',
	tags: ['TODOs'],
	params: {
		type: 'object',
		properties: {
			id: {
				type: 'string',
				minLength: 1,
				pattern: '^[0-9a-fA-F]{24}$',
				description: 'Unique identifier'
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
				maxLength: 2000,
				description: 'New task description'
			},
			completed: {
				type: 'boolean',
				description: 'New completion status'
			}
		},
		additionalProperties: false,
	},
	response: {
		200: {
			description: 'TODO updated successfully',
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
			description: 'TODO not found',
			type: 'object',
			properties: {
				error: { type: 'string' }
			}
		},
		400: {
			description: 'Invalid data',
			type: 'object',
			properties: {
				error: { type: 'string' }
			}
		}
	}
} as const;

// Schema for PATCH (update only completed)
export const SchemaCompletion = {
	description: 'Update the completion status of a TODO',
	tags: ['TODOs'],
	params: {
		type: 'object',
		properties: {
			id: {
				type: 'string',
				minLength: 1,
				pattern: '^[0-9a-fA-F]{24}$',
				description: 'Unique identifier'

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
				description: 'New completion status'
			}
		},
		required: ['completed'],
		additionalProperties: false
	},
	response: {
		200: {
			description: 'Completion status updated successfully',
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
			description: 'TODO not found',
			type: 'object',
			properties: {
				error: { type: 'string' }
			}
		}
	}
} as const;

// Schema for DELETE
export const SchemaDelete = {
	description: 'Delete a TODO',
	tags: ['TODOs'],
	params: {
		type: 'object',
		properties: {
			id: {
				type: 'string',
				minLength: 1,
				pattern: '^[0-9a-fA-F]{24}$',
				description: 'Unique identifier'

			}
		},
		required: ['id'],
		additionalProperties: false
	},
	response: {
		204: {
			description: 'TODO deleted successfully (no content)',
			type: 'null'
		},
		404: {
			description: 'TODO not found',
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
			description: 'System stats',
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