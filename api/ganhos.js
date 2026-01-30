import crypto from "crypto";
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
  const ganhos = db.collection("ganhos");

  // ✅ LISTAR GANHOS
  if (req.method === "GET") {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "userId é obrigatório" });
    }

    const data = await ganhos
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();

    return res.status(200).json(data);
  }

  // ✅ CRIAR GANHO (RECEITA) PELO SITE
  if (req.method === "POST") {
    try {
      const {
        userId,
        username,   // opcional
        valor,
        descricao,  // opcional
        data,       // "YYYY-MM-DD" (opcional)
        isEmpresa,  // opcional
      } = req.body || {};

      if (!userId) return res.status(400).json({ error: "userId é obrigatório" });
      if (valor === undefined || valor === null || valor === "")
        return res.status(400).json({ error: "valor é obrigatório" });

      const valorNumero = Number(valor);
      if (Number.isNaN(valorNumero) || valorNumero <= 0) {
        return res.status(400).json({ error: "valor inválido" });
      }

      // 🗓️ respeita a data escolhida no site (evita cair um dia antes por fuso)
      const createdAt = data ? new Date(`${data}T12:00:00`) : new Date();

      // 🔐 hash igual conceito do bot (dedup)
      // inclui userId + valor + descricao + data pra não bloquear ganhos repetidos em dias diferentes
      const baseHash = `${userId}|${valorNumero}|${descricao || ""}|${createdAt.toISOString().slice(0, 10)}`;
      const hash = crypto.createHash("md5").update(baseHash).digest("hex");

      const existe = await ganhos.findOne({ hash });
      if (existe) {
        return res.status(200).json({ ok: true, duplicated: true, ganho: existe });
      }

      const doc = {
        userId,
        username: username ? String(username).trim() : "Site",
        valor: valorNumero,
        descricao: descricao ? String(descricao).trim() : "",
        hash,
        isEmpresa: Boolean(isEmpresa),
        createdAt,
      };

      const r = await ganhos.insertOne(doc);

      return res.status(201).json({
        ok: true,
        insertedId: r.insertedId,
        ganho: { ...doc, _id: r.insertedId },
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Erro ao salvar ganho" });
    }
  }

  return res.status(405).json({ error: "Método não permitido" });
}
