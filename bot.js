import { Telegraf } from 'telegraf';
import 'dotenv/config';
import db from './db.js';
import { buscarFilmes } from './tmdb.js';

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

const buscasPendentes = new Map();

bot.command('vigiar', async (ctx) => {
  const nomeFilme = ctx.message.text.split(' ').slice(1).join(' ');

  if (!nomeFilme) {
    return ctx.reply('Use assim: /vigiar Nome do Filme');
  }

  const resultados = await buscarFilmes(nomeFilme);

  if (resultados.length === 0) {
    return ctx.reply(`Não encontrei nenhum filme com o nome "${nomeFilme}".`);
  }

  let mensagem = 'Encontrei estes filmes, responda com o número do correto:\n\n';
  resultados.forEach((filme, index) => {
    mensagem += `${index + 1}. ${filme.titulo} (${filme.ano})\n`;
  });

  buscasPendentes.set(ctx.chat.id, resultados);

  ctx.reply(mensagem);
});

bot.on('text', async (ctx) => {
  const chatId = ctx.chat.id;
  const texto = ctx.message.text.trim();

  if (!buscasPendentes.has(chatId)) return;
  if (!/^\d+$/.test(texto)) return;

  const resultados = buscasPendentes.get(chatId);
  const escolha = parseInt(texto) - 1;

  if (escolha < 0 || escolha >= resultados.length) {
    return ctx.reply('Número inválido, tente de novo.');
  }

  const filme = resultados[escolha];

  db.prepare(`
    INSERT INTO filmes_vigiados (tmdb_id, titulo, poster_path, chat_id)
    VALUES (?, ?, ?, ?)
  `).run(filme.tmdbId, filme.titulo, filme.posterPath, chatId);

  buscasPendentes.delete(chatId);

  ctx.reply(`✅ Adicionado!\n\nVou avisar quando "${filme.titulo}" ficar disponível para streaming.`);
});

bot.command('lista', (ctx) => {
  const filmes = db.prepare('SELECT titulo FROM filmes_vigiados WHERE chat_id = ?').all(ctx.chat.id);

  if (filmes.length === 0) {
    return ctx.reply('Você não está vigiando nenhum filme ainda.');
  }

  const lista = filmes.map((f) => `• ${f.titulo}`).join('\n');
  ctx.reply(`🎬 Seus filmes vigiados:\n\n${lista}`);
});




