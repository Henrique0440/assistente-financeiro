import { connectPernalongaBot } from "../scripts/database.js";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
    // 🔹 CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(204).end();
    }

    const db = await connectPernalongaBot();
    const lembrestes = db.collection("lembretes");

    // 🔹 LISTAR LEMBRETES
    if (req.method === "GET") {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ error: "userId é obrigatório" });
        }

        const data = await lembrestes
            .find({ userId })
            .sort({ createdAt: -1 })
            .toArray();

        return res.status(200).json(data);
    }

    // 🔹 DELETAR LEMBRETE
    if (req.method === "DELETE") {
        const { id } = req.query;

        if (!id) {
            return res.status(400).json({ error: "id do lembrete é obrigatório" });
        }

        try {
            const result = await lembrestes.deleteOne({ _id: new ObjectId(id) });

            if (result.deletedCount === 0) {
                return res.status(404).json({ error: "Lembrete não encontrado" });
            }

            return res.status(200).json({ message: "Lembrete deletado com sucesso!" });
        } catch (err) {
            return res.status(500).json({ error: "Erro ao deletar lembrete", detalhes: err.message });
        }
    }

    return res.status(405).json({ error: "Método não permitido" });
}
