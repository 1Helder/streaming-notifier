import db from './db.js';
import { buscarDisponibilidade } from './tmdb.js';

export async function verificarFilmes(bot) {
  const filmes = db.prepare('SELECT * FROM filmes_vigiados WHERE notificado = 0').all();

  console.log(`Verificando ${filmes.length} filme(s)...`);

  for (const filme of filmes) {
    const disponibilidade = await buscarDisponibilidade(filme.tmdb_id);

    const temNosEUA = disponibilidade.US.length > 0;
    const temNoBrasil = disponibilidade.BR.length > 0;

    if (temNosEUA || temNoBrasil) {
      console.log(`"${filme.titulo}" está disponível! Notificando chat ${filme.chat_id}...`);

      await bot.telegram.sendMessage(
        filme.chat_id,
        `🎬 ${filme.titulo}\n\nJá está disponível para assistir no streaming!`
      );

      db.prepare('UPDATE filmes_vigiados SET notificado = 1 WHERE id = ?').run(filme.id);
    }
  }
}