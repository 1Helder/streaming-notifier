import "dotenv/config";

const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

export async function buscarFilmes(nome) {
  const url = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(nome)}&language=pt-BR`;
  const resposta = await fetch(url);
  const dados = await resposta.json();

  if (!dados.results || dados.results.lenght === 0) {
    return [];
  }

  return dados.results.slice(0, 5).map((filme) => ({
    tmdbId: filme.id,
    titulo: filme.title,
    posterPath: filme.poster_path,
    ano: filme.release_date ? filme.release_date.slice(0, 4) : "????",
  }));
}
