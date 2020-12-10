import mongoose from 'mongoose';

const explorationSchema = mongoose.Schema(
    {
        explorationDate: { type: Date, required: true },
        destination: { type: String, required: true },
        vault: new mongoose.Schema({ inox: Number, elements: [{
            element: { type: String },
            quantity: { type: Number }
        }] }),
        explorer: { type: mongoose.ObjectId, required: true }
    },
    {
        collection: 'explorations',
    }
);

export default mongoose.model('Exploration', explorationSchema);
