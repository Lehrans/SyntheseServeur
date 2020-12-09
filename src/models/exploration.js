import mongoose from 'mongoose';

const explorationSchema = mongoose.Schema(
    {
        explorationDate: { type: Date },
        destination: { type: String },
        vault: { 
            inox: { type: Number },
            elements: [{
                element: { type: String },
                quantity: { type: Number }
            }]
        },
        explorer: { type: String }
   },
    {
        collection: 'explorations',
    }
);

export default mongoose.model('Exploration', explorationSchema);
