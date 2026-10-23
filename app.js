import { initializeAuth, login, logout, accessToken } from "./auth.js";


// ============================================
// gameLibrary 2.0 — Frontend
// Projeto de Software — Insper 2026.2
// ============================================

// ---------- CONFIGURAÇÃO ----------

const API = {
  jogos: "http://localhost:8080/api/jogos",
  musicas: "http://localhost:8082/api/musicas",
  enl: "http://localhost:8083/api/enlistamentos"
};

const PASTAS = [
  { id: "favorito", nome: "Favoritos", cor: "#ffd36d" },
  { id: "lista de compras", nome: "Lista de compras", cor: "#69c8ff" },
  { id: "quero jogar", nome: "Quero jogar", cor: "#a5ed83" }
];

const DEMO_KEY = "gamelibrary-demo-mode";
const queryDemo = new URLSearchParams(location.search).get("demo");

const DEMO = queryDemo === "1" ||
  (queryDemo !== "0" && localStorage.getItem(DEMO_KEY) !== "off");

const $ = (selector, root = document) =>
  root.querySelector(selector);

const esc = value =>
  String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));

const S = {
  jogos: [],
  enl: [],
  busca: "",
  filtro: "",
  destaque: 0,
  catalogo: [],
  capaSelecionada: "",
  carregado: false
};

const pasta = id =>
  PASTAS.find(p => p.id === id) || PASTAS[0];

const horas = jogos =>
  jogos.reduce((total, j) => total + Number(j.duracaoHoras || 0), 0);

const duracao = segundos => {
  const s = Number(segundos) || 0;
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

const dataBR = data => {
  if (!data) return "Não informada";
  const d = new Date(`${data}T00:00:00`);
  return Number.isNaN(d.getTime())
    ? "Não informada"
    : d.toLocaleDateString("pt-BR");
};

// ---------- DADOS DE DEMONSTRAÇÃO ----------

const DEMO_JOGOS = [
  {
    id: 1,
    titulo: "The Legend of Zelda: Breath of the Wild",
    plataforma: "Nintendo Switch",
    desenvolvedora: "Nintendo",
    tipoJogo: "Aventura",
    dataLancamento: "2017-03-03",
    duracaoHoras: 120,
    pasta: "favorito",
    trilhaSonora: "Breath of the Wild OST"
  },
  {
    id: 2,
    titulo: "Red Dead Redemption 2",
    plataforma: "PlayStation 4",
    desenvolvedora: "Rockstar Games",
    tipoJogo: "Ação / Aventura",
    dataLancamento: "2018-10-26",
    duracaoHoras: 80,
    pasta: "favorito",
    trilhaSonora: "Red Dead Redemption 2 OST"
  },
  {
    id: 3,
    titulo: "Hades",
    plataforma: "PC",
    desenvolvedora: "Supergiant Games",
    tipoJogo: "Roguelike",
    dataLancamento: "2020-09-17",
    duracaoHoras: 45,
    pasta: "quero jogar",
    trilhaSonora: "Hades OST"
  },
  {
    id: 4,
    titulo: "Hollow Knight",
    plataforma: "PC",
    desenvolvedora: "Team Cherry",
    tipoJogo: "Metroidvania",
    dataLancamento: "2017-02-24",
    duracaoHoras: 60,
    pasta: "lista de compras",
    trilhaSonora: "Hollow Knight OST"
  },
  {
    id: 5,
    titulo: "Stardew Valley",
    plataforma: "PC",
    desenvolvedora: "ConcernedApe",
    tipoJogo: "Simulação",
    dataLancamento: "2016-02-26",
    duracaoHoras: 95,
    pasta: "favorito",
    trilhaSonora: "Stardew Valley OST"
  },
  {
    id: 6,
    titulo: "God of War",
    plataforma: "PlayStation 4",
    desenvolvedora: "Santa Monica Studio",
    tipoJogo: "Ação",
    dataLancamento: "2018-04-20",
    duracaoHoras: 55,
    pasta: "quero jogar",
    trilhaSonora: "God of War OST"
  },
  {
    id: 7,
    titulo: "Celeste",
    plataforma: "PC",
    desenvolvedora: "Extremely OK Games",
    tipoJogo: "Plataforma",
    dataLancamento: "2018-01-25",
    duracaoHoras: 18,
    pasta: "favorito",
    trilhaSonora: "Celeste OST"
  },
  {
    id: 8,
    titulo: "Ori and the Blind Forest",
    plataforma: "PC",
    desenvolvedora: "Moon Studios",
    tipoJogo: "Aventura",
    dataLancamento: "2015-03-11",
    duracaoHoras: 24,
    pasta: "lista de compras",
    trilhaSonora: "Ori OST"
  },
  {
    id: 9,
    titulo: "Cyberpunk 2077",
    plataforma: "PC",
    desenvolvedora: "CD Projekt Red",
    tipoJogo: "RPG",
    dataLancamento: "2020-12-10",
    duracaoHoras: 70,
    pasta: "quero jogar",
    trilhaSonora: "Cyberpunk OST"
  },
  {
    id: 10,
    titulo: "Minecraft",
    plataforma: "PC",
    desenvolvedora: "Mojang",
    tipoJogo: "Sandbox",
    dataLancamento: "2011-11-18",
    duracaoHoras: 160,
    pasta: "favorito",
    trilhaSonora: "Minecraft OST"
  },
  {
    id: 11,
    titulo: "Portal 2",
    plataforma: "PC",
    desenvolvedora: "Valve",
    tipoJogo: "Puzzle",
    dataLancamento: "2011-04-19",
    duracaoHoras: 14,
    pasta: "favorito",
    trilhaSonora: "Portal 2 OST"
  },
  {
    id: 12,
    titulo: "Journey",
    plataforma: "PlayStation 4",
    desenvolvedora: "thatgamecompany",
    tipoJogo: "Aventura",
    dataLancamento: "2012-03-13",
    duracaoHoras: 6,
    pasta: "favorito",
    trilhaSonora: "Journey OST"
  }
];

const DEMO_MUSICAS = [
  { id: 1, jogoId: 2, titulo: "Unshaken", artista: "D'Angelo", album: "RDR2 OST", duracaoSegundos: 277 },
  { id: 2, jogoId: 2, titulo: "That's the Way It Is", artista: "Daniel Lanois", album: "RDR2 OST", duracaoSegundos: 242 },
  { id: 3, jogoId: 2, titulo: "Mountain Hymn", artista: "Rhiannon Giddens", album: "RDR2 OST", duracaoSegundos: 226 },
  { id: 4, jogoId: 2, titulo: "The Housebuilding Song", artista: "David Ferguson", album: "RDR2 OST", duracaoSegundos: 312 },
  { id: 5, jogoId: 4, titulo: "Dirtmouth", artista: "Christopher Larkin", album: "Hollow Knight OST", duracaoSegundos: 87 },
  { id: 6, jogoId: 4, titulo: "Greenpath", artista: "Christopher Larkin", album: "Hollow Knight OST", duracaoSegundos: 136 },
  { id: 7, jogoId: 4, titulo: "Hornet", artista: "Christopher Larkin", album: "Hollow Knight OST", duracaoSegundos: 161 },
  { id: 8, jogoId: 1, titulo: "Main Theme", artista: "Manaka Kataoka", album: "Zelda OST", duracaoSegundos: 213 },
  { id: 9, jogoId: 3, titulo: "Out of Tartarus", artista: "Darren Korb", album: "Hades OST", duracaoSegundos: 304 }
];

const demoDB = {
  jogos: structuredClone(DEMO_JOGOS),
  musicas: structuredClone(DEMO_MUSICAS),
  enl: []
};

// ---------- DEMO API ----------

async function mockHttp(url, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  const body = options.body ? JSON.parse(options.body) : null;

  let tipo;
  let base;

  if (url.startsWith(API.jogos)) {
    tipo = "jogos";
    base = API.jogos;
  } else if (url.startsWith(API.musicas)) {
    tipo = "musicas";
    base = API.musicas;
  } else {
    tipo = "enl";
    base = API.enl;
  }

  const dados = demoDB[tipo];
  const resto = url.slice(base.length);

  if (tipo === "jogos" && resto.startsWith("/catalogo")) {
    const busca = new URL(url).searchParams
      .get("busca")?.toLowerCase() || "";

    return {
      results: demoDB.jogos
        .filter(j => j.titulo.toLowerCase().includes(busca))
        .map(j => ({
          name: j.titulo,
          released: j.dataLancamento,
          background_image: "",
          genres: [{ name: j.tipoJogo }],
          platforms: [{ platform: { name: j.plataforma } }]
        }))
    };
  }

  const id = Number(resto.split("/")[1]);

  if (method === "POST") {
    const novo = {
      ...body,
      id: Math.max(0, ...dados.map(x => Number(x.id))) + 1
    };
    dados.push(novo);
    return { ...novo };
  }

  if (method === "PUT") {
    const pos = dados.findIndex(x => Number(x.id) === id);
    if (pos < 0) throw new Error("Registro não encontrado.");
    dados[pos] = { ...dados[pos], ...body };
    return { ...dados[pos] };
  }

  if (method === "DELETE") {
    const pos = dados.findIndex(x => Number(x.id) === id);
    if (pos >= 0) dados.splice(pos, 1);
    return null;
  }

  if (id) {
    return dados.find(x => Number(x.id) === id) || null;
  }

  const jogoId = new URL(url).searchParams.get("jogoId");

  return jogoId
    ? dados.filter(x => Number(x.jogoId) === Number(jogoId))
    : dados.map(x => ({ ...x }));
}

// ---------- REQUISIÇÕES HTTP ----------

async function http(url, options = {}) {
  if (DEMO) {
    return mockHttp(url, options);
  }

  let token;
  try {
    token = await accessToken();
  } catch (error) {
    $("#auth-login").hidden = false;
    throw error;
  }
  let response;

  try {
    response = await fetch(url, {
      ...options,
      headers: { ...options.headers, "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    });
  } catch {
    throw new Error(
      "Não foi possível conectar à API. Verifique se os microsserviços estão ativos e se o CORS está configurado."
    );
  }

  if (response.status === 401) {
    $("#auth-login").hidden = false;
    throw new Error("A API recusou a sessão. Entre novamente e verifique o público (audience) configurado.");
  }

  if (!response.ok) {
    let message = "";

    try {
      const data = await response.json();
      message = data.message || data.error || "";
    } catch {}

    throw new Error(message || `Erro HTTP ${response.status}`);
  }

  if (response.status === 204) return null;

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

// ---------- NOTIFICAÇÕES ----------

let toastTimer;

function toast(message, error = false) {
  const el = $("#toast");

  el.textContent = message;
  el.className = `show${error ? " error" : ""}`;

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    el.className = "";
  }, 3500);
}

// ---------- CAPAS ----------

let capas = {};

try {
  capas = JSON.parse(localStorage.getItem("gamelibrary-capas") || "{}");
} catch {
  capas = {};
}

function salvarCapa(titulo, url) {
  if (!url) return;

  capas[titulo.toLowerCase()] = url;
  localStorage.setItem("gamelibrary-capas", JSON.stringify(capas));
}

async function buscarCapa(titulo) {
  const key = titulo.toLowerCase();

  if (capas[key]) return capas[key];
  if (DEMO) return "";

  try {
    const data = await http(
      `${API.jogos}/catalogo?busca=${encodeURIComponent(titulo)}`
    );

    const url = data.results?.[0]?.background_image || "";

    if (url) salvarCapa(titulo, url);

    return url;
  } catch {
    return "";
  }
}

function cover(jogo) {
  const id = Number(jogo.id) || 0;

  return `
    <div
      class="cover cover-${id % 12}"
      data-cover="${esc(jogo.titulo)}"
    >
      <b>${esc(jogo.titulo)}</b>
    </div>
  `;
}

async function carregarCapas(root = document) {
  root.querySelectorAll("[data-cover]").forEach(async el => {
    const titulo = el.dataset.cover;
    const imageUrl = await buscarCapa(titulo);

    if (imageUrl && el.isConnected) {
      el.style.backgroundImage = `url(${JSON.stringify(imageUrl)})`;
      el.classList.add("has-image");
    }
  });
}

// ---------- DADOS ----------

async function carregar() {
  const [jogos, enl] = await Promise.all([
    http(API.jogos),
    http(API.enl).catch(() => [])
  ]);

  S.jogos = Array.isArray(jogos) ? jogos : [];
  S.enl = Array.isArray(enl) ? enl : [];
  S.carregado = true;
}

function emPasta(jogo, idPasta) {
  return jogo.pasta === idPasta ||
    S.enl.some(e =>
      Number(e.jogoId) === Number(jogo.id) &&
      e.pasta === idPasta
    );
}

// ---------- COMPONENTES ----------

function vazio(titulo, descricao, acao = "") {
  return `
    <div class="empty">
      <h2>${esc(titulo)}</h2>
      <p>${esc(descricao)}</p>
      ${acao}
    </div>
  `;
}

function infos(jogo) {
  return `
    <div class="chips">
      <span>${esc(jogo.tipoJogo)}</span>
      <span>${esc(jogo.plataforma)}</span>
      <span>${Number(jogo.duracaoHoras) || 0}h de jogo</span>
    </div>
  `;
}

function card(jogo) {
  const p = pasta(jogo.pasta);

  return `
    <a class="game-card" href="#/jogo/${jogo.id}">
      ${cover(jogo)}

      <div class="card-content">
        <strong title="${esc(jogo.titulo)}">
          ${esc(jogo.titulo)}
        </strong>

        <small>${esc(jogo.desenvolvedora)}</small>

        <span class="tag" style="--color:${p.cor}">
          ${esc(p.nome)}
        </span>
      </div>
    </a>
  `;
}

function destaque(jogo) {
  return `
    <a class="feature-main" href="#/jogo/${jogo.id}">
      ${cover(jogo)}

      <div class="feature-info">
        <h2>${esc(jogo.titulo)}</h2>
        ${infos(jogo)}
      </div>
    </a>
  `;
}

// ---------- BIBLIOTECA ----------

function biblioteca() {
  const jogos = S.jogos;

  const filtrados = jogos.filter(j => {
    const filtroOK = !S.filtro || emPasta(j, S.filtro);
    const buscaOK = j.titulo.toLowerCase().includes(S.busca);
    return filtroOK && buscaOK;
  });

  const favoritos = jogos.filter(j => emPasta(j, "favorito"));

  const hero = `
    <section class="hero-head">
      <div class="hero-content">

        <div class="page-heading">
          <p class="eyebrow">SEU UNIVERSO GAMER</p>
          <h1>Minha biblioteca<span style="color:var(--green)">.</span></h1>
          <p>Explore, organize e redescubra seus jogos favoritos.</p>
        </div>

        <div class="stats">
          <div class="stat">
            <small>Jogos na biblioteca</small>
            <strong>${jogos.length}</strong>
          </div>

          <div class="stat">
            <small>Jogos favoritos</small>
            <strong>${favoritos.length}</strong>
          </div>

          <div class="stat">
            <small>Horas cadastradas</small>
            <strong>${horas(jogos).toLocaleString("pt-BR")}h</strong>
          </div>
        </div>
      </div>
    </section>
  `;

  if (!jogos.length) {
    return hero + vazio(
      "Sua biblioteca está vazia",
      "Adicione seu primeiro jogo para começar.",
      '<button class="btn btn-primary" data-act="novo">Adicionar jogo</button>'
    );
  }

  const destacados = [...jogos]
    .sort((a, b) =>
      Number(emPasta(b, "favorito")) -
      Number(emPasta(a, "favorito"))
    )
    .slice(0, 5);

  const selecionado = destacados[S.destaque] || destacados[0];

  const secaoDestaque = !S.busca && !S.filtro ? `
    <div class="section-heading">
      <h2>Em destaque</h2>
      <p>Selecionados da sua biblioteca</p>
    </div>

    <section class="featured">
      ${destaque(selecionado)}

      <div class="feature-list">
        ${destacados.map((j, i) => `
          <button
            type="button"
            class="feature-item ${S.destaque === i ? "on" : ""}"
            data-feature="${i}"
          >
            ${cover(j)}
            <span>${esc(j.titulo)}</span>
          </button>
        `).join("")}
      </div>
    </section>
  ` : "";

  const sidebar = `
    <aside class="sidebar">
      <h3>Coleções</h3>

      <button data-filter="" class="${!S.filtro ? "on" : ""}">
        🎮 Todos os jogos
        <i>${jogos.length}</i>
      </button>

      ${PASTAS.map(p => `
        <button
          data-filter="${esc(p.id)}"
          class="${S.filtro === p.id ? "on" : ""}"
        >
          <span class="dot" style="--color:${p.cor}"></span>
          ${esc(p.nome)}
          <i>${jogos.filter(j => emPasta(j, p.id)).length}</i>
        </button>
      `).join("")}
    </aside>
  `;

  return `
    ${hero}
    ${secaoDestaque}

    <div class="section-heading">
      <h2>Todos os jogos</h2>
      <p>${filtrados.length} ${filtrados.length === 1 ? "jogo" : "jogos"}</p>
    </div>

    <div class="library">
      ${sidebar}

      <section>
        ${filtrados.length
          ? `<div class="game-grid">${filtrados.map(card).join("")}</div>`
          : vazio(
              "Nenhum jogo encontrado",
              "Experimente outra busca ou coleção."
            )
        }
      </section>
    </div>
  `;
}

// ---------- DETALHES DO JOGO ----------

function infoBox(rotulo, valor) {
  return `
    <div class="info-box">
      <small>${esc(rotulo)}</small>
      <strong>${esc(valor)}</strong>
    </div>
  `;
}

async function detalhes(id) {
  const jogo = S.jogos.find(j => Number(j.id) === id);

  if (!jogo) {
    return vazio(
      "Jogo não encontrado",
      "Este jogo não está mais na biblioteca.",
      '<a class="btn btn-secondary" href="#/">Voltar</a>'
    );
  }

  const musicas = await http(
    `${API.musicas}?jogoId=${id}`
  ).catch(() => null);

  const chips = PASTAS.map(p => {
    const principal = jogo.pasta === p.id;

    const extra = S.enl.find(e =>
      Number(e.jogoId) === id && e.pasta === p.id
    );

    const ativo = principal || !!extra;

    return `
      <button
        type="button"
        class="collection-chip ${ativo ? "on" : ""}"
        style="--color:${p.cor}"
        data-act="${extra ? "desenlistar" : "enlistar"}"
        data-pasta="${esc(p.id)}"
        data-enlist="${extra?.id ?? ""}"
        ${principal ? "disabled" : ""}
      >
        ${esc(p.nome)}
      </button>
    `;
  }).join("");

  const total = (musicas || []).reduce(
    (n, m) => n + Number(m.duracaoSegundos || 0), 0
  );

  return `
    <div class="breadcrumb">
      <a href="#/">Biblioteca</a> / Detalhes do jogo
    </div>

    <div class="detail-heading">
      <h1>${esc(jogo.titulo)}</h1>

      <div class="actions">
        <button class="btn btn-secondary" data-act="editar" data-id="${id}">
          ✎ Editar
        </button>

        <button class="btn btn-danger" data-act="excluir" data-id="${id}">
          Excluir
        </button>
      </div>
    </div>

    <section class="detail-layout">
      ${cover(jogo)}

      <div class="info-panel">
        ${infoBox("Desenvolvedora", jogo.desenvolvedora)}
        ${infoBox("Plataforma", jogo.plataforma)}
        ${infoBox("Tipo de jogo", jogo.tipoJogo)}
        ${infoBox("Lançamento", dataBR(jogo.dataLancamento))}
        ${infoBox("Horas de jogo", `${jogo.duracaoHoras} horas`)}
        ${infoBox("Trilha sonora", jogo.trilhaSonora)}
      </div>
    </section>

    <section class="collection-bar">
      <strong>Guardar em</strong>
      ${chips}
    </section>

    <section class="panel">
      <h2>
        Trilha sonora
        ${musicas ? `(${musicas.length} faixas · ${duracao(total)})` : ""}
      </h2>

      ${musicas === null
        ? "<p>Serviço de músicas indisponível.</p>"
        : tabelaMusicas(musicas, true)
      }

      ${musicas !== null ? `
        <details ${!musicas.length ? "open" : ""}>
          <summary>＋ Adicionar faixa</summary>
          ${formMusica(id)}
        </details>
      ` : ""}
    </section>
  `;
}

// ---------- MÚSICAS ----------

function tabelaMusicas(musicas, editar = false) {
  if (!musicas.length) {
    return "<p>Nenhuma faixa cadastrada.</p>";
  }

  return `
    <div class="table-scroll">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Faixa</th>
            <th>Artista</th>
            <th>Álbum</th>
            <th>Duração</th>
            ${editar ? "<th>Ações</th>" : ""}
          </tr>
        </thead>

        <tbody>
          ${musicas.map((m, i) => `
            <tr>
              <td>${i + 1}</td>
              <td>${esc(m.titulo)}</td>
              <td>${esc(m.artista)}</td>
              <td>${esc(m.album || "—")}</td>
              <td>${duracao(m.duracaoSegundos)}</td>
              ${editar ? `
                <td>
                  <button
                    type="button"
                    class="delete-track"
                    data-act="rmMusica"
                    data-id="${m.id}"
                  >
                    Remover
                  </button>
                </td>
              ` : ""}
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function formMusica(jogoId) {
  return `
    <form id="fm" class="track-form" data-jogo="${jogoId}">
      <label>
        Nome da faixa
        <input name="titulo" required>
      </label>

      <label>
        Artista
        <input name="artista" required>
      </label>

      <label>
        Álbum
        <input name="album">
      </label>

      <label>
        Duração (m:ss)
        <input name="dur" placeholder="3:45"
               pattern="[0-9]+:[0-5][0-9]" required>
      </label>

      <label>
        Lançamento
        <input name="dataLancamento" type="date" required>
      </label>

      <label>
        Gênero
        <input name="genero">
      </label>

      <button type="submit" class="btn btn-primary">
        Salvar faixa
      </button>
    </form>
  `;
}

async function trilhas() {
  const musicas = await http(API.musicas).catch(() => null);

  if (musicas === null) {
    return vazio(
      "Músicas indisponíveis",
      "O serviço de músicas não está respondendo."
    );
  }

  const ids = [...new Set(musicas.map(m => Number(m.jogoId)))];

  const hero = `
    <section class="music-hero">
      <div>
        <p class="eyebrow" style="color:#edbdff">
          SUA COLEÇÃO DE MÚSICAS
        </p>

        <h1>Trilhas sonoras<span style="color:#dca6ff">.</span></h1>

        <p>Todas as faixas dos seus jogos em um só lugar.</p>
      </div>

      <span class="music-art" aria-hidden="true">♫</span>
    </section>
  `;

  if (!ids.length) {
    return hero + vazio(
      "Nenhuma trilha sonora",
      "Abra um jogo para cadastrar suas músicas."
    );
  }

  const grupos = ids.map(id => {
    const jogo = S.jogos.find(j => Number(j.id) === id);
    const faixas = musicas.filter(m => Number(m.jogoId) === id);
    const total = faixas.reduce(
      (n, m) => n + Number(m.duracaoSegundos || 0), 0
    );

    return `
      <section class="music-group">
        <div class="music-group-head">
          ${jogo ? cover(jogo) : ""}

          <div>
            <h2>
              <a href="#/jogo/${id}">
                ${esc(jogo?.titulo || `Jogo #${id}`)}
              </a>
            </h2>

            <p>${faixas.length} faixas · ${duracao(total)}</p>
          </div>
        </div>

        ${tabelaMusicas(faixas)}
      </section>
    `;
  }).join("");

  return hero + grupos;
}

// ---------- FORMULÁRIO DE JOGO ----------

function campo(nome, titulo, tipo = "text", valor = "") {
  return `
    <label>
      ${titulo}
      <input
        name="${nome}"
        type="${tipo}"
        value="${esc(valor)}"
        ${tipo === "number" ? 'min="1"' : ""}
        required
      >
    </label>
  `;
}

function abrirFormulario(jogo = null) {
  const novo = !jogo;

  jogo = jogo || {};
  S.catalogo = [];
  S.capaSelecionada = "";

  $("#dlg").innerHTML = `
    <form id="fj" class="form" data-id="${jogo.id ?? ""}">
      <h2>${novo ? "Adicionar jogo" : "Editar jogo"}</h2>

      ${novo ? `
        <div class="catalog-search">
          <input
            id="catalog-input"
            placeholder="Procurar no catálogo RAWG..."
            aria-label="Buscar no catálogo RAWG"
          >

          <button type="button"
                  class="btn btn-secondary"
                  data-act="catalogo">
            Buscar
          </button>
        </div>

        <ul id="catalog-results" class="catalog-results"></ul>
      ` : ""}

      <div class="form-grid">
        ${campo("titulo", "Título", "text", jogo.titulo)}
        ${campo("plataforma", "Plataforma", "text", jogo.plataforma)}
        ${campo("desenvolvedora", "Desenvolvedora", "text", jogo.desenvolvedora)}
        ${campo("tipoJogo", "Tipo de jogo", "text", jogo.tipoJogo)}
        ${campo("dataLancamento", "Data de lançamento", "date", jogo.dataLancamento)}
        ${campo("duracaoHoras", "Duração (horas)", "number", jogo.duracaoHoras)}

        <label>
          Coleção principal
          <select name="pasta">
            ${PASTAS.map(p => `
              <option value="${esc(p.id)}"
                      ${p.id === jogo.pasta ? "selected" : ""}>
                ${esc(p.nome)}
              </option>
            `).join("")}
          </select>
        </label>

        ${campo("trilhaSonora", "Trilha sonora", "text", jogo.trilhaSonora)}
      </div>

      <div class="form-actions">
        <button type="button"
                class="btn btn-secondary"
                data-act="fechar">
          Cancelar
        </button>

        <button type="submit" class="btn btn-primary">
          Salvar jogo
        </button>
      </div>
    </form>
  `;

  $("#dlg").showModal();
}

// ---------- EVENTOS DE CLIQUE ----------

document.addEventListener("click", async event => {
  const el = event.target.closest(
    "[data-act], [data-filter], [data-feature], [data-result]"
  );

  if (!el) return;

  const d = el.dataset;

  try {
    // Filtrar biblioteca
    if ("filter" in d) {
      S.filtro = d.filter;
      await rota();
      return;
    }

    // Trocar destaque
    if ("feature" in d) {
      S.destaque = Number(d.feature);
      await rota();
      return;
    }

    // Selecionar resultado do catálogo
    if ("result" in d) {
      const resultado = S.catalogo[Number(d.result)];
      if (!resultado) return;

      const form = $("#fj");

      const preencher = (nome, valor) => {
        if (valor) form.elements[nome].value = valor;
      };

      preencher("titulo", resultado.name);
      preencher("dataLancamento", resultado.released);
      preencher("tipoJogo", resultado.genres?.[0]?.name);
      preencher("plataforma", resultado.platforms?.[0]?.platform?.name);

      S.capaSelecionada = resultado.background_image || "";
      $("#catalog-results").innerHTML = "";
      return;
    }

    const id = Number(d.id);

    switch (d.act) {
      case "novo":
        abrirFormulario();
        break;

      case "editar": {
        const jogo = S.jogos.find(j => Number(j.id) === id);
        if (jogo) abrirFormulario(jogo);
        break;
      }

      case "fechar":
        $("#dlg").close();
        break;

      case "catalogo": {
        const termo = $("#catalog-input").value.trim();

        if (!termo) {
          toast("Digite o nome de um jogo.", true);
          return;
        }

        const resposta = await http(
          `${API.jogos}/catalogo?busca=${encodeURIComponent(termo)}`
        );

        S.catalogo = resposta.results || [];

        $("#catalog-results").innerHTML =
          S.catalogo.map((j, i) => `
            <li data-result="${i}"
                role="button"
                tabindex="0">
              ${j.background_image
                ? `<img src="${esc(j.background_image)}" alt="">`
                : `<span>🎮</span>`
              }

              <div>
                <strong>${esc(j.name)}</strong>
                <small>${esc(j.released?.slice(0, 4) || "Sem data")}</small>
              </div>
            </li>
          `).join("") || "<li>Nenhum resultado encontrado.</li>";

        break;
      }

      case "excluir": {
        if (!confirm("Excluir este jogo da biblioteca?")) return;

        await http(`${API.jogos}/${id}`, { method: "DELETE" });
        await carregar();

        toast("Jogo excluído.");
        location.hash = "#/";
        await rota();
        break;
      }

      case "enlistar": {
        const jogoId = Number(location.hash.split("/")[2]);

        await http(API.enl, {
          method: "POST",
          body: JSON.stringify({
            jogoId,
            pasta: d.pasta
          })
        });

        await carregar();
        toast("Jogo adicionado à coleção.");
        await rota();
        break;
      }

      case "desenlistar": {
        await http(`${API.enl}/${d.enlist}`, {
          method: "DELETE"
        });

        await carregar();
        toast("Jogo removido da coleção.");
        await rota();
        break;
      }

      case "rmMusica": {
        if (!confirm("Remover esta faixa?")) return;

        await http(`${API.musicas}/${id}`, {
          method: "DELETE"
        });

        toast("Faixa removida.");
        await rota();
        break;
      }
    }
  } catch (error) {
    toast(error.message, true);
  }
});

// ---------- ACESSIBILIDADE / TECLADO ----------

document.addEventListener("keydown", event => {
  if (
    event.key === "Enter" &&
    event.target.matches("[data-result]")
  ) {
    event.preventDefault();
    event.target.click();
  }

  if (
    event.key === "Enter" &&
    event.target.id === "catalog-input"
  ) {
    event.preventDefault();
    $('[data-act="catalogo"]').click();
  }
});

// ---------- ENVIO DE FORMULÁRIOS ----------

document.addEventListener("submit", async event => {
  event.preventDefault();

  const form = event.target;
  const dados = Object.fromEntries(new FormData(form));

  try {
    if (form.id === "fj") {
      dados.duracaoHoras = Number(dados.duracaoHoras);

      const id = form.dataset.id;

      const resultado = await http(
        id ? `${API.jogos}/${id}` : API.jogos,
        {
          method: id ? "PUT" : "POST",
          body: JSON.stringify(dados)
        }
      );

      if (S.capaSelecionada) {
        salvarCapa(dados.titulo, S.capaSelecionada);
      }

      $("#dlg").close();
      await carregar();

      toast(id ? "Jogo atualizado." : "Jogo adicionado.");

      location.hash = `#/jogo/${resultado.id}`;
      await rota();
    }

    if (form.id === "fm") {
      const [minutos, segundos] = dados.dur.split(":").map(Number);

      await http(API.musicas, {
        method: "POST",
        body: JSON.stringify({
          jogoId: Number(form.dataset.jogo),
          titulo: dados.titulo,
          artista: dados.artista,
          album: dados.album || null,
          genero: dados.genero || null,
          dataLancamento: dados.dataLancamento,
          duracaoSegundos: minutos * 60 + segundos
        })
      });

      toast("Faixa adicionada.");
      await rota();
    }
  } catch (error) {
    toast(error.message, true);
  }
});

// ---------- BUSCA ----------

$("#q").addEventListener("input", event => {
  S.busca = event.target.value.trim().toLowerCase();

  if (location.hash && location.hash !== "#/") {
    location.hash = "#/";
  } else {
    rota();
  }
});

// ---------- MODO DEMONSTRAÇÃO ----------

const modeButton = $("#mode-toggle");

modeButton.textContent = DEMO
  ? "● Demonstração"
  : "○ Modo API";

modeButton.classList.toggle("api", !DEMO);

modeButton.addEventListener("click", () => {
  const proximoModo = !DEMO;

  localStorage.setItem(
    DEMO_KEY,
    proximoModo ? "on" : "off"
  );

  location.href =
    location.pathname +
    (proximoModo ? "?demo=1" : "?demo=0") +
    "#/";
});

// ---------- ROTEAMENTO ----------

let renderId = 0;
let authenticated = false;
let authReady = DEMO;

async function rota() {
  const atual = ++renderId;
  const hash = location.hash || "#/";
  const app = $("#app");

  document.querySelectorAll("nav a").forEach(link => {
    link.classList.toggle(
      "on",
      link.hash === (hash.startsWith("#/trilhas") ? "#/trilhas" : "#/")
    );
  });

  if (!authReady) return;
  if (!DEMO && !authenticated) {
    app.innerHTML = vazio("Entre na sua conta", "Use o botão Entrar para acessar sua biblioteca.");
    return;
  }

  try {
    if (!S.carregado) {
      app.innerHTML = vazio(
        "Carregando biblioteca...",
        "Preparando seus jogos."
      );

      await carregar();
    }

    const match = hash.match(/^#\/jogo\/(\d+)/);

    let conteudo;

    if (match) {
      conteudo = await detalhes(Number(match[1]));
    } else if (hash === "#/trilhas") {
      conteudo = await trilhas();
    } else {
      conteudo = biblioteca();
    }

    if (atual !== renderId) return;

    app.innerHTML = conteudo;

    carregarCapas(app);
  } catch (error) {
    if (atual !== renderId) return;

    app.innerHTML = vazio(
      "A biblioteca não abriu",
      error.message,
      '<button class="btn btn-secondary" data-act="recarregar">Tentar novamente</button>'
    );
  }
}

// Recarregar após erro
document.addEventListener("click", event => {
  if (event.target.closest('[data-act="recarregar"]')) {
    S.carregado = false;
    rota();
  }
});

window.addEventListener("hashchange", () => {
  rota();
  window.scrollTo(0, 0);
});

// ---------- INICIALIZAÇÃO ----------

$("#auth-login").addEventListener("click", () => login().catch(error => toast(error.message, true)));
$("#auth-logout").addEventListener("click", () => logout().catch(error => toast(error.message, true)));

async function iniciar() {
  if (!DEMO) {
    $("#auth-login").hidden = false;
    try {
      authenticated = await initializeAuth();
      $("#auth-login").hidden = authenticated;
      $("#auth-logout").hidden = !authenticated;
    } catch (error) {
      toast(error.message, true);
    }
    authReady = true;
  }
  await rota();
}

iniciar();
