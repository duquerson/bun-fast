import { Schema } from 'mongoose';
import type { ITodo } from '../types/todo.d.ts';

export const schema = new Schema<ITodo>({
	description: {
		type: String,
		required: [true, 'Description is required'],
		trim: true,
		minlength: [1, 'Description must be at least 1 character long'],
		maxlength: [2000, 'Description must be at most 2000 characters long']
	},
	completed: {
		type: Boolean,
		default: false,
		required: true
	}
}, {
	timestamps: true,
	versionKey: false,
	toJSON: {
		transform: (doc, ret) => {
			if (ret._id) {
				ret.id = ret._id.toString();
				Reflect.deleteProperty(ret, '_id');
			}
			return ret;
		}
	},
	toObject: {
		transform: function (doc, ret) {
			ret.id = ret._id.toString();
			Reflect.deleteProperty(ret, '_id');
			return ret;
		}
	}
});
