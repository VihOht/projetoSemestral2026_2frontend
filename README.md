
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
- Client ID: `lWFWbWJEMrJjJ6CXI4SWQGhYb1iYT7Wa`
- Audience: `https://dev-bpbgrel3zl2chj7s.us.auth0.com/api/v2/`

No painel Auth0, confirme que a aplicação desse Client ID é do tipo **Single Page Application** e configure:

- Allowed Callback URLs: `http://localhost:5500/`
- Allowed Logout URLs: `http://localhost:5500/`
- Allowed Web Origins: `http://localhost:5500`

Se usar `127.0.0.1`, adicione também os endereços correspondentes. Para outro caminho ou porta, cadastre a URL exata; ajuste também `CORS_ALLOWED_ORIGINS` no backend. Em produção, use HTTPS.

Sirva esta pasta com `python3 -m http.server 5500`, abra `http://localhost:5500/?demo=0#/` e clique em **Entrar**. Após o login, cada requisição aos três serviços inclui o access token; **Sair** encerra a sessão Auth0. Os tokens ficam no cache em memória do SDK. O navegador precisa acessar o CDN oficial Auth0 para carregar o SDK em modo API.

O modo `?demo=1` funciona sem carregar o SDK ou chamar Auth0. A preferência de modo é armazenada localmente; tokens não são gravados no localStorage.

A audiência atual é da Management API, preservada do exemplo. Para usar uma API GameLibrary própria, configure o mesmo Identifier em `auth.js` e `AUTH0_AUDIENCE` nos três serviços. Nunca coloque client secrets no navegador.

Verificação local dos fluxos de autenticação (SDK simulado):

```bash
node --test tests/auth.test.mjs
```

O teste real do login depende das configurações acima no tenant Auth0.
