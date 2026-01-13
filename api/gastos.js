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
  
  return res.status(405).json({ error: "Método não permitido" });
}
