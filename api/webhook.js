import { connectPernalongaBot } from "../scripts/database.js";

export default async function handler(req, res) {
  // 🔹 CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const db = await connectPernalongaBot();
    const usuarios = db.collection("usuarios"); // ou "pagamentos"

    const data = req.body;

    // 🔹 Exemplo de campos do webhook Kiwify
    const usuarioData = {
      nome: data.Customer?.full_name || "Desconhecido",
      email: data.Customer?.email || "",
      telefone: data.Customer?.mobile || "",
      pedido: data.order_id || "",
      valor: data.amount || 0,
      status: data.order_status || "pendente",
      criadoEm: new Date()
    };

    await usuarios.insertOne(usuarioData);

    // Aqui você poderia chamar função pra mandar WhatsApp usando Z-API, Twilio, etc.
    // sendWhatsapp(usuarioData.telefone, `Compra recebida: ${usuarioData.pedido} - ${usuarioData.valor}`);

    return res.status(201).json({ success: true, data: usuarioData });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao salvar dados" });
  }
}
