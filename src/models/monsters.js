import mongoose from 'mongoose';

const monsterSchema = mongoose.Schema(
    {
        talents: [String],
        kernel: [String],
        atlasNumber: { type: Number },
        name: { type: String },
        health: { type: Number },
        damage: { type: Number },
        speed: { type: Number },
        critical: { type: Number },
        affinity: { type: String },
        assets: { type: String },
        hash: { type: String },
        explorer: { type: mongoose.ObjectId },
        explorations: { type: mongoose.ObjectId },
    },
    {
        collection: 'monsters',
    }
);

export default mongoose.model('Monster', monsterSchema);
