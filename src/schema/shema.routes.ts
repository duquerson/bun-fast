
export const SchemaID = {
	params: {
		type: 'object',
		properties: {
			id: { type: 'string', minLength: 1 }
		},
		required: ['id'],
		additionalProperties: false
	}
} as const;

export const SchemaBODY = {
	body: {
		type: 'object',
		properties: {
			description: {
				type: 'string',
				minLength: 1,
				maxLength: 500
			},
			completed: { type: 'boolean' }
		},
		required: ['description', 'completed'],
		additionalProperties: false,
	}
} as const

export const SchemaUpdateTodo = {
	...SchemaID,
	...SchemaBODY
} as const;

export const SchemaCompletion = {
	body: {
		type: 'object',
		properties: {
			completed: {
				type: 'boolean'
			}
		},
		required: ['completed'],
		additionalProperties: false
	}
} as const;