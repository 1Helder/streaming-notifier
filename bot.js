import { Telegraf } from "telegraf";
import "dotenv/config";
import db from "./db.js";
import {buscarFilmes} from './tmdb.js'

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN)

const buscasPendentes = new Map();

bot.command('vigiar', async (ctx) => {
    const nomeFilme = ctx.message.text.split(' ').slice(1).join(' ')

    if(!nomeFilme){
        return ctx.reply("Use assim: /vigiar Nome do Filme")
    }

    const resultados = await buscarFilmes(nomeFilme)

    if(resultados.length === 0){
        return ctx.reply(`Não encontrei nenhum filme com o nome "${nomeFilme}".`)
    }

    let mensagem = "Encontrei estes filmes, responda com o número do correto:\n\n";
    resultados.forEach((filme, index) => {
        mensagem += `${index + 1}. ${filme.titulo} (${filme.ano})\n`
    })

    buscasPendentes.set(ctx.chat.id, resultados)

    ctx.reply(mensagem)

})