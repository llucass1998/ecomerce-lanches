// Carrega as variaveis do arquivo .env, como PORT e DATABASE_URL.
import 'dotenv/config';

// Importa a aplicacao Express ja configurada no app.ts.
import { app } from './app.js';

// Usa a porta do .env. Se nao tiver PORT no .env, usa 3000.
const PORT = Number(process.env.PORT) || 3000;

// Inicia o servidor e mostra no terminal em qual porta ele esta rodando.
app.listen(PORT, () => {
  console.log(`Servidor inicializado na porta ${PORT}`);
});
