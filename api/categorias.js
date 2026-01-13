import { connectPernalongaBot } from "../scripts/database.js";

export default async function handler(req, res) {
    // 🔹 CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(204).end();
    }

    const db = await connectPernalongaBot();
    const categorias = db.collection("categorias");

    // 🔹 LISTAR CATEGORIAS
    if (req.method === "GET") {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ error: "userId é obrigatório" });
        }

        const data = await categorias.find({ userId }).toArray();
        return res.status(200).json(data);
    }

    // 🔹 CRIAR CATEGORIA (opcional)
    if (req.method === "POST") {
        const { userId, username, nome, palavras } = req.body;

        if (!userId || !nome) {
            return res.status(400).json({ error: "Campos obrigatórios ausentes" });
        }

        await categorias.insertOne({
            userId,
            username: username || "Desconhecido",
            nome: nome.toLowerCase(),
            palavras: palavras || [],
            createdAt: new Date()
        });

        return res.status(201).json({ success: true });
    }

    import { connectPernalongaBot } from "../scripts/database.js";

export default async function handler(req, res) {
    // 🔹 CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(204).end();
    }

    const db = await connectPernalongaBot();
    const categorias = db.collection("categorias");

    // 🔹 LISTAR CATEGORIAS
    if (req.method === "GET") {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ error: "userId é obrigatório" });
        }

        const data = await categorias.find({ userId }).toArray();
        return res.status(200).json(data);
    }

    // 🔹 CRIAR CATEGORIA (opcional)
    if (req.method === "POST") {
        const { userId, username, nome, palavras } = req.body;

        if (!userId || !nome) {
            return res.status(400).json({ error: "Campos obrigatórios ausentes" });
        }

        await categorias.insertOne({
            userId,
            username: username || "Desconhecido",
            nome: nome.toLowerCase(),
            palavras: palavras || [],
            createdAt: new Date()
        });

        return res.status(201).json({ success: true });
    }

    if (req.method === "PUT") {
        const { userId, nome, palavras } = req.body;

        if (!userId || !nome || !Array.isArray(palavras)) {
            return res.status(400).json({ error: "Campos obrigatórios ausentes ou inválidos" });
        }

        const categoria = await categorias.findOne({ userId, nome: nome.toLowerCase() });

        if (!categoria) {
            return res.status(404).json({ error: "Categoria não encontrada" });
        }

        await categorias.updateOne(
            { userId, nome: nome.toLowerCase() },
            { $set: { palavras, updatedAt: new Date() } }
        );

        return res.status(200).json({ success: true, mensagem: "Palavras-chave atualizadas" });
    }

    return res.status(405).json({ error: "Método não permitido" });
}


    return res.status(405).json({ error: "Método não permitido" });
}

