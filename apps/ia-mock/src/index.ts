import express from "express";
import cors from "cors";
import { ConfigData, IMachineData, ReadingData } from "./types";

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.use("/analyze", (req, res) => {
    const data: IMachineData[] = req.body;
    
    try {
        console.log("Recibiendo los datos en IA MOCK: ", data);

        console.log("UNA READ: ", data[0].readings[data[0].readings.length - 1]);
        res.status(200).json({ ok: true });
    } catch(e) {
        console.error("Error recibiendo los datos", e);
    }
});

app.listen(8081, () => console.log(`IA mock listening on port 8081`))