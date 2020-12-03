import mongoose from 'mongoose';

const accountSchema = mongoose.Schema(
    {
        email: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        hash: { type: String, required: true },
        salt: { type: String, required: true },
        refreshToken: { type: String },
        createdDate: { type: Date, default: Date.now },
    },
    {
        collection: 'accounts',
    }
);

export default mongoose.model('Account', accountSchema);
