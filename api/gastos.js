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
  const gastos = db.collection("gastos");

  // 🔹 LISTAR GASTOS
  if (req.method === "GET") {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "userId é obrigatório" });
    }

    const data = await gastos
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();

    return res.status(200).json(data);
  }

  // 🔹 CRIAR GASTO (opcional, se quiser usar API pra salvar)
  if (req.method === "POST") {
    const {
      userId,
      username,
      categoria,
      valor,
      descricao,
      origem,
      hash
    } = req.body;

    if (!userId || !categoria || !valor) {
      return res.status(400).json({ error: "Campos obrigatórios ausentes" });
    }

    await gastos.insertOne({
      userId,
      username: username || "Desconhecido",
      categoria,
      valor,
      descricao,
      origem,
      hash,
      createdAt: new Date()
    });

    return res.status(201).json({ success: true });
  }

  return res.status(405).json({ error: "Método não permitido" });
}
