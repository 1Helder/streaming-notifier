import db from "./db.js";
import { buscarDisponibilidade } from "./tmdb.js";

const BANDEIRAS = {
  US: "🇺🇸",
  BR: "🇧🇷",
};

export async function verificarFilmes(bot) {
  const filmes = db
    .prepare("SELECT * FROM filmes_vigiados WHERE notificado = 0")
    .all();

  console.log(`Verificando ${filmes.length} filme(s)...`);

  for (const filme of filmes) {
    const disponibilidade = await buscarDisponibilidade(filme.tmdb_id);

    const temNosEUA = disponibilidade.US.length > 0;
    const temNoBrasil = disponibilidade.BR.length > 0;

    if (temNosEUA || temNoBrasil) {
      console.log(
        `"${filme.titulo}" está disponível! Notificando chat ${filme.chat_id}...`,
      );

      const paises = [];
      if (temNosEUA) paises.push("US");
      if (temNoBrasil) paises.push("BR");

      const nomesStreamings = [
        ...disponibilidade.US.map((p) => p.provider_name),
        ...disponibilidade.BR.map((p) => p.provider_name),
      ];
      const streamingsUnicos = [...new Set(nomesStreamings)];

      const linhaStreamings = `📺 ${streamingsUnicos.join(", ")}`;
      const linhaPaises = paises.map((pais) => BANDEIRAS[pais]).join(" ");

      const mensagem =
        `🎬 ${filme.titulo}\n\n` +
        `Já está disponível para assistir no streaming!\n\n` +
        `${linhaStreamings}\n` +
        `${linhaPaises}`;

      if (filme.poster_path) {
        const posterUrl = `https://image.tmdb.org/t/p/w500${filme.poster_path}`;
        await bot.telegram.sendPhoto(filme.chat_id, posterUrl, {
          caption: mensagem,
        });
      } else {
        await bot.telegram.sendMessage(filme.chat_id, mensagem);
      }

      db.prepare("UPDATE filmes_vigiados SET notificado = 1 WHERE id = ?").run(
        filme.id,
      );
    }
  }
}
