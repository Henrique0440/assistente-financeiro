import { connectPernalongaBot } from "../scripts/database.js";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
    // 🔹 CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") return res.status(204).end();

    const db = await connectPernalongaBot();
    const categorias = db.collection("categorias");

    // 🔹 LISTAR CATEGORIAS
    if (req.method === "GET") {
        const { userId } = req.query;
        if (!userId) return res.status(400).json({ error: "userId é obrigatório" });

        const data = await categorias.find({ userId }).toArray();
        return res.status(200).json(data);
    }

    // 🔹 CRIAR CATEGORIA
    if (req.method === "POST") {
        const { userId, username, nome, palavras, isEmpresa } = req.body;
        if (!userId || !nome) return res.status(400).json({ error: "Campos obrigatórios ausentes" });

        const result = await categorias.insertOne({
            userId,
            username: username || "Desconhecido",
            nome: nome.toLowerCase(),
            palavras: palavras || [],
            isEmpresa: isEmpresa || false,
            createdAt: new Date()
        });

        return res.status(201).json({ success: true, id: result.insertedId });
    }

    // 🔹 EDITAR CATEGORIA PELO ID
    if (req.method === "PUT") {
        const { id, nome, palavras } = req.body;
        if (!id || (!nome && !palavras)) return res.status(400).json({ error: "ID e pelo menos um campo para atualizar são obrigatórios" });

        const updateFields = {};
        if (nome) updateFields.nome = nome.toLowerCase();
        if (palavras) updateFields.palavras = palavras;

        const result = await categorias.updateOne(
            { _id: new ObjectId(id) },
            { $set: { ...updateFields, updatedAt: new Date() } }
        );

        if (result.matchedCount === 0) return res.status(404).json({ error: "Categoria não encontrada" });

        return res.status(200).json({ success: true, mensagem: "Categoria atualizada" });
    }

    // 🔹 DELETAR CATEGORIA PELO ID
    if (req.method === "DELETE") {
        const { id } = req.body;
        if (!id) return res.status(400).json({ error: "ID é obrigatório" });

        const result = await categorias.deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) return res.status(404).json({ error: "Categoria não encontrada" });

        return res.status(200).json({ success: true, mensagem: "Categoria deletada" });
    }

    return res.status(405).json({ error: "Método não permitido" });
}
