import { connectPernalongaBot } from "../scripts/database.js";

function normalizarNumeroAntigoBR(input) {
  if (!input) return null;

  let numero = input.replace(/\D/g, '');

  if (numero.startsWith('00')) numero = numero.slice(2);
  if (numero.startsWith('55')) numero = numero.slice(2);

  if (numero.length < 10 || numero.length > 11) return null;

  const ddd = numero.slice(0, 2);
  let telefone = numero.slice(2);

  // celular novo → converte para formato antigo
  if (telefone.length === 9 && telefone.startsWith('9')) {
    telefone = telefone.slice(1);
  }

  if (telefone.length !== 8) return null;

  return `55${ddd}${telefone}`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido" });

  try {
    const db = await connectPernalongaBot();
    const usuarios = db.collection("usuarios");
    const data = req.body;

    // Normaliza número do cliente
    const telefoneNormalizado = normalizarNumeroAntigoBR("+55 (61) 999714472");
    if (!telefoneNormalizado) return res.status(400).json({ error: "Número inválido" });

    const userId = `${telefoneNormalizado}@s.whatsapp.net`;
    const agora = new Date();
    const expiraEm = new Date();
    expiraEm.setDate(expiraEm.getDate() + 30); // Expira em 30 dias
    const plano = typeof data.Subscription.plan.name === 'string' ? data.Subscription.plan.name.toLowerCase() : 'premium';
    const tipoEvento = data.webhook_event_type;
    
    const usuarioData = {
      userId,
      ativo: true,
      plano,
      expiraEm,
      mensagemenviada: false,
      tipoEvento,
      updatedAt: agora
    };

    await usuarios.updateOne({ userId }, { $set: usuarioData }, { upsert: true });
    return res.status(201).json({ success: true, data: usuarioData });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao salvar usuário" });
  }
}
