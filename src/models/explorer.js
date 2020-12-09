import mongoose from 'mongoose';

const explorerSchema = mongoose.Schema(
    {
        explorerName: { type: String, required: true, unique: true },
        username: { type: String, required: true },
        hash: { type: String, required: true },
        salt: { type: String, required: true },
        refreshToken: { type: String },
        inox: { type: Number },
        elements: [{
            element: { type: String },
            quantity: { type: Number }
        }]
   },
    {
        collection: 'explorers',
    }
);

export default mongoose.model('Explorer', explorerSchema);
