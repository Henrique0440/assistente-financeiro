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

  // ✅ LISTAR GASTOS
  if (req.method === "GET") {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "userId é obrigatório" });
    }

    const data = await gastos.find({ userId }).sort({ createdAt: -1 }).toArray();
    return res.status(200).json(data);
  }

  // ✅ CRIAR GASTO (salvar pelo site)
  if (req.method === "POST") {
    try {
      const {
        userId,
        categoria,
        valor,
        descricao,
        origem,
        isEmpresa,
        createdAt,
      } = req.body || {};

      // validações
      if (!userId) return res.status(400).json({ error: "userId é obrigatório" });
      if (!categoria) return res.status(400).json({ error: "categoria é obrigatório" });
      if (valor === undefined || valor === null || valor === "")
        return res.status(400).json({ error: "valor é obrigatório" });

      const valorNumero = Number(valor);
      if (Number.isNaN(valorNumero) || valorNumero <= 0) {
        return res.status(400).json({ error: "valor inválido" });
      }

      const doc = {
        userId,
        categoria: String(categoria).trim(),
        valor: valorNumero,
        descricao: descricao ? String(descricao).trim() : "",
        origem: origem ? String(origem).trim() : "site",
        isEmpresa: Boolean(isEmpresa),
        createdAt: createdAt ? new Date(createdAt) : new Date(),
      };

      const r = await gastos.insertOne(doc);

      return res.status(201).json({
        ok: true,
        insertedId: r.insertedId,
        gasto: { ...doc, _id: r.insertedId },
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Erro ao salvar gasto" });
    }
  }

  return res.status(405).json({ error: "Método não permitido" });
}
