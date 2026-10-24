
# gameLibrary 2.0

Frontend do projeto de software 2026.2.

Aplicação para organizar uma biblioteca de jogos, gerenciar coleções e cadastrar trilhas sonoras.

## Tecnologias

- HTML5
- CSS3
- JavaScript
- API REST
- RAWG API (integração pelo backend)

## Funcionalidades

- Biblioteca de jogos
- Dashboard com estatísticas
- Jogos em destaque
- Pesquisa e filtros
- Coleções: Favoritos, Lista de compras e Quero jogar
- Cadastro, edição e exclusão de jogos
- Busca no catálogo RAWG
- Detalhes de jogos
- Gerenciamento de trilhas sonoras
- Layout responsivo
- Modo demonstração sem backend

## Como executar

Na pasta do projeto:

```bash
python3 -m http.server 5500
```

Acesse:

http://localhost:5500/?demo=1#/

## Modo demonstração

O modo demonstração permite navegar pelo frontend sem iniciar o backend.

Inclui 12 jogos e trilhas de exemplo.

As alterações feitas nesse modo são temporárias e desaparecem ao atualizar a página.

## Integração com o backend

Endpoints previstos:

- Jogos: http://localhost:8080/api/jogos
- Músicas: http://localhost:8082/api/musicas
- Enlistamentos: http://localhost:8083/api/enlistamentos

Para usar os serviços reais, acesse:

http://localhost:5500/?demo=0#/

O backend deve estar em execução e permitir requisições do frontend via CORS.

## Observações

A integração completa com os microsserviços deve ser validada pela equipe.

As capas de demonstração são ilustrações abstratas. Quando disponíveis, as imagens do catálogo RAWG podem substituí-las.

## Login com Auth0

O frontend ativo é HTML/JavaScript, servido por `index.html`; não é necessário instalar React. `auth.js` usa o SDK oficial Auth0 SPA e os valores públicos encontrados em `main.jsx`:

- Domain: `dev-bpbgrel3zl2chj7s.us.auth0.com`
- Client ID: `rYUQIAvqPJ0Q9ZyMHmc6GYcDLyy8D1bk`
- Audience: `https://dev-bpbgrel3zl2chj7s.us.auth0.com/api/v2/`

No painel Auth0, confirme que a aplicação desse Client ID é do tipo **Single Page Application** e configure:

- Allowed Callback URLs: `http://localhost:5500/`
- Allowed Logout URLs: `http://localhost:5500/`
- Allowed Web Origins: `http://localhost:5500`

Se usar `127.0.0.1`, adicione também os endereços correspondentes. Para outro caminho ou porta, cadastre a URL exata; ajuste também `CORS_ALLOWED_ORIGINS` no backend. Em produção, use HTTPS.

Sirva esta pasta com `python3 -m http.server 5500`, abra `http://localhost:5500/?demo=0#/` e clique em **Entrar**. Após o login, cada requisição aos três serviços inclui o access token; **Sair** encerra a sessão Auth0. Os tokens ficam no cache persistente (`localStorage`) gerenciado pelo SDK, permitindo manter o login ao recarregar a página ou voltar à Home. O botão **Sair** limpa esse cache pelo SDK. Como esse armazenamento é acessível ao JavaScript da mesma origem, evite scripts não confiáveis e mantenha proteção contra XSS. O navegador precisa acessar o CDN oficial Auth0 para carregar o SDK em modo API.

O modo `?demo=1` funciona sem carregar o SDK ou chamar Auth0. A preferência de modo também é armazenada localmente. Uma sessão expirada ainda depende da renovação pelo Auth0; caso ela não seja possível, será necessário entrar novamente.

A audiência atual é da Management API, preservada do exemplo. Para usar uma API GameLibrary própria, configure o mesmo Identifier em `auth.js` e `AUTH0_AUDIENCE` nos três serviços. Nunca coloque client secrets no navegador.

Verificação local dos fluxos de autenticação (SDK simulado):

```bash
node --test tests/auth.test.mjs
```

O teste real do login depende das configurações acima no tenant Auth0.

## Comunicação mínima com os serviços

Ao abrir o frontend sem parâmetros, o modo API é o padrão. Uma preferência anterior por demonstração continua sendo respeitada; use `?demo=0` para forçar API ou `?demo=1` para demonstração.

As URLs usam o mesmo protocolo e hostname do frontend, com portas 8080 (jogos), 8082 (músicas) e 8083 (enlistamentos). Para execução local, inicie os três serviços com `docker compose up --build` na pasta `backend`, sirva esta pasta na porta 5500 e abra `http://localhost:5500/?demo=0#/`. Configure o `.env` do backend conforme seu README.

Entre com Auth0 antes de usar os serviços. Erros ao carregar coleções ou músicas são exibidos na tela, sem substituir respostas com falha por listas vazias. Para acessar por outro hostname, autorize também esse endereço no Auth0 e em `CORS_ALLOWED_ORIGINS`; se usar HTTPS, os serviços também precisam estar disponíveis por HTTPS.
