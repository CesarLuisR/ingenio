import mongoose, { Schema } from "mongoose";

export async function connectDB() {
    const uri = process.env.MONGO_URI || "mongodb://mongo:27017/ingenio";
    await mongoose.connect(uri);
    console.log("Conectado a MongoDB");
}

const MetricRangeSchema = new Schema(
    {
        unit: { type: String, default: "" },   // p.ej. "A", "V", "°C"
        min: { type: Number, required: false },
        max: { type: Number, required: false },
    },
    { _id: false }
);

const MetricsConfigSchema = new Schema(
    {
        type: Map,
        of: new Schema(
            {
                type: Map,
                of: MetricRangeSchema,
            },
            { _id: false }
        ),
    },
    { _id: false }
);

const SensorSchema = new Schema(
    {
        sensorId: { type: String, required: true, unique: true },
        type: { type: String, default: "generic" },
        location: { type: String, default: "unknown" },
        intervalMs: { type: Number, default: 3000 },
        metricsConfig: MetricsConfigSchema,
        createdAt: { type: Date, default: Date.now },
        lastSeen: { type: Date },
        active: { type: Boolean, default: true },
        configVersion: { type: String, default: "v1" },
    },
    { versionKey: false }
);

SensorSchema.index({ sensorId: 1 }, { unique: true });

const ReadingSchema = new Schema(
    {
        sensorId: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        metrics: {
            type: Object,
            required: true,
        },
    },
    { versionKey: false }
);

ReadingSchema.index({ sensorId: 1, timestamp: -1 });

export const Sensor = mongoose.model("Sensor", SensorSchema);
export const Reading = mongoose.model("Reading", ReadingSchema);
