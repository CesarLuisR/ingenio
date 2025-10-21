import { RequestHandler } from "express";
import axios from "axios";

import { Reading } from "../../database/mongo.db"
import { ConfigData, IMachineData, ReadingData } from "../../types/sensorTypes";
import { getSensorConfig } from "../repositories/sensorRepository";

export const getAnalysis: RequestHandler = async (req, res) => {
    const IA_API = process.env.IA_API || "Sin IA_API configurada";
    const data: string[] = req.body;
    const request: IMachineData[] = [];

    try {
        for (const sensor of data) {
            const sensorConfig: ConfigData = await getSensorConfig(sensor);
            if (!sensorConfig) throw new Error("Sensor no existente");

            const readings: ReadingData[] = await Reading.find({ sensorId: sensor });
            request.push({
                config: sensorConfig,
                readings: readings
            });
        }
    } catch (e) {
        console.error("Error creando el requestData", e);
    }

    try {
        const response = await axios.post(`${IA_API}/analyze`, request);
        res.status(200).json(response);
    } catch(e) {
        console.error("Error requesting the IA Server", e);
    }
};

