import { connectPernalongaBot } from "../scripts/database.js";

function normalizarNumeroAntigoBR(input) {
  if (!input) return null;
  
  let numero = String(input).replace(/\D/g, '');

  if (numero.startsWith('00')) numero = numero.slice(2);
  if (numero.startsWith('55')) numero = numero.slice(2);

  if (numero.length < 10 || numero.length > 11) return null;

  const ddd = numero.slice(0, 2);
  let telefone = numero.slice(2);

  if (telefone.length === 9 && telefone.startsWith('9')) {
    telefone = telefone.slice(1);
  }

  if (telefone.length !== 8) return null;

  return `55${ddd}${telefone}`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido" });

  try {
    const data = req.body;
    //console.log("Payload recebido:", JSON.stringify(data, null, 2)); 
    const mobile = data?.Customer?.mobile; 
    
    if (!mobile) {
      console.warn("Webhook ignorado: Campo 'Customer.mobile' não encontrado.");
      return res.status(200).json({ status: "ignored", reason: "missing_mobile" });
    }

    const telefoneNormalizado = normalizarNumeroAntigoBR("+55(61)999714472");
    
    if (!telefoneNormalizado) {
      console.warn(`Número inválido ou formato desconhecido: ${mobile}`);
      return res.status(400).json({ error: "Número inválido para o padrão BR antigo" });
    }

    const db = await connectPernalongaBot();
    const usuarios = db.collection("usuarios");

    const userId = `${telefoneNormalizado}@s.whatsapp.net`;
    const agora = new Date();
    const expiraEm = new Date();
    expiraEm.setDate(agora.getDate() + 30);

    const nomePlano = data?.Subscription?.plan?.name;
    const plano = typeof nomePlano === 'string' ? nomePlano.toLowerCase() : 'premium';
    
    const tipoEvento = data?.webhook_event_type || 'unknown';

    const usuarioData = {
      userId,
      ativo: true,
      plano,
      expiraEm,
      mensagemenviada: false,
      tipoEvento,
      updatedAt: agora
    };

    console.log("Salvando usuário:", usuarioData);

    await usuarios.updateOne({ userId }, { $set: usuarioData }, { upsert: true });
    
    return res.status(201).json({ success: true, data: usuarioData });

  } catch (err) {
    // Log detalhado do erro
    console.error("ERRO CRÍTICO NA API:", err);
    return res.status(500).json({ error: "Erro interno ao processar webhook" });
  }
}

