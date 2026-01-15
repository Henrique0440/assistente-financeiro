import { connectPernalongaBot } from "../scripts/database.js";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
    // 🔹 CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") return res.status(204).end();

    const db = await connectPernalongaBot();
    const metas = db.collection("metas");

    // 🔹 LISTAR METAS
    if (req.method === "GET") {
        const { userId } = req.query;
        if (!userId) return res.status(400).json({ error: "userId é obrigatório" });

        const data = await metas.find({ userId }).toArray();
        return res.status(200).json(data);
    }

    // 🔹 CRIAR META
    if (req.method === "POST") {
        const { userId, nome, objetivo } = req.body;
        if (!userId || !nome || objetivo == null) return res.status(400).json({ error: "Campos obrigatórios ausentes" });

        const result = await metas.insertOne({
            userId,
            nome,
            objetivo,
            saldo: 0,
            createdAt: new Date()
        });

        return res.status(201).json({ success: true, id: result.insertedId });
    }

    // 🔹 EDITAR META
    if (req.method === "PUT") {
        const { id, nome, objetivo, saldo } = req.body;
        if (!id) return res.status(400).json({ error: "ID é obrigatório" });

        const updateFields = {};
        if (nome) updateFields.nome = nome;
        if (objetivo != null) updateFields.objetivo = objetivo;
        if (saldo != null) updateFields.saldo = saldo;

        const result = await metas.updateOne(
            { _id: new ObjectId(id) },
            { $set: { ...updateFields, updatedAt: new Date() } }
        );

        if (result.matchedCount === 0) return res.status(404).json({ error: "Meta não encontrada" });

        return res.status(200).json({ success: true, mensagem: "Meta atualizada" });
    }

    // 🔹 DELETAR META
    if (req.method === "DELETE") {
        const { id } = req.body;
        if (!id) return res.status(400).json({ error: "ID é obrigatório" });

        const result = await metas.deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) return res.status(404).json({ error: "Meta não encontrada" });

        return res.status(200).json({ success: true, mensagem: "Meta deletada" });
    }

    return res.status(405).json({ error: "Método não permitido" });
}
