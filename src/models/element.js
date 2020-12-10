import mongoose from 'mongoose';

const elementSchema = mongoose.Schema(
    {
        element: { type: String },
        quantity: { type: Number }
    }
);

export default mongoose.model('Element', elementSchema);
