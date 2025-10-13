import mongoose from "mongoose";

export async function connectDB() {
    const uri = process.env.MONGO_URI || "mongodb://mongo:27017/ingenio"
    await mongoose.connect(uri);
    console.log("Conectado a MongoDB");
}

const readingSchema = new mongoose.Schema({
    sensorId: { type: String, required: true },
    value: { type: Number, required: true },
    unit: { type: String, default: "°C" },
    ts: { type: Date, required: true },
    seq: { type: Number }
});

export const Reading = mongoose.model("Reading", readingSchema);