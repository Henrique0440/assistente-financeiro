import { connectDB } from "../scripts/database.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const db = await connectDB();
    const usuarios = db.collection("usuarios"); // Coleção para salvar usuários/planos

    const data = req.body;

    // Pega o número do cliente e remove o 9 extra se tiver
    let telefone = data.Customer?.mobile || "";
    if (!telefone) return res.status(400).json({ error: "Número de telefone obrigatório" });

    // Remover o '9' extra caso queira (exemplo: pega os 11 dígitos e ignora o primeiro 9 se houver)
    if (telefone.length === 11 && telefone[2] === "9") {
      telefone = telefone.slice(0, 2) + telefone.slice(3);
    }

    // Monta o userId no formato do WhatsApp
    const userId = `${telefone}@s.whatsapp.net`;

    // Define o plano baseado no produto
    const plano = data.Product?.product_name.toLowerCase() || "premium";

    // Datas
    const agora = new Date();
    const expiraEm = new Date();
    expiraEm.setMonth(expiraEm.getMonth() + 12); // Exemplo: plano válido por 12 meses

    const usuarioData = {
      userId,
      ativo: true,
      plano,
      expiraEm,
      updatedAt: agora,
      ultimoRegistro: agora
    };

    // Salva ou atualiza se já existir
    await usuarios.updateOne(
      { userId },
      { $set: usuarioData },
      { upsert: true }
    );

    return res.status(201).json({ success: true, data: usuarioData });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao salvar usuário" });
  }
}
