import mongoose from "mongoose";

const explorerSchema = mongoose.Schema(
  {
    explorerName: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    hash: { type: String, required: true },
    salt: { type: String, required: true },
    refreshToken: { type: String },
    inox: { type: Number, default: 0 },
    location: { type: String, default: "Unknown" },
    elements: {
      type: Array,
      default: [
        { element: "A", quantity: 0 },
        { element: "B", quantity: 0 },
        { element: "E", quantity: 0 },
        { element: "Ex", quantity: 0 },
        { element: "Fr", quantity: 0 },
        { element: "G", quantity: 0 },
        { element: "I", quantity: 0 },
        { element: "Ja", quantity: 0 },
        { element: "K", quantity: 0 },
        { element: "L", quantity: 0 },
        { element: "No", quantity: 0 },
        { element: "Q", quantity: 0 },
        { element: "Sm", quantity: 0 },
        { element: "Ve", quantity: 0 },
        { element: "Wu", quantity: 0 },
        { element: "Xu", quantity: 0 },
        { element: "Ye", quantity: 0 },
        { element: "Z", quantity: 0 }
      ],
    },
  },
  {
    collection: "explorers",
  }
);

export default mongoose.model("Explorer", explorerSchema);
