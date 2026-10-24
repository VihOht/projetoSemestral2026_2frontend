import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../auth.js', import.meta.url), 'utf8');
let sequence = 0;
async function setup(search = '', route = '#/trilhas') {
  const calls = [];
  globalThis.location = { origin: 'http://localhost:5500', pathname: '/', search, hash: route };
  globalThis.history = { replaceState: (...args) => calls.push(['replace', ...args]) };
  globalThis.localStorage = { setItem: (...args) => calls.push(['store', ...args]) };
  const sdk = {
    checkSession: async () => calls.push(['session']),
    isAuthenticated: async () => true,
    handleRedirectCallback: async () => ({ appState: { route } }),
    loginWithRedirect: async options => calls.push(['login', options]),
    logout: async options => calls.push(['logout', options]),
    getTokenSilently: async () => 'access-token'
  };
  globalThis.window = { location, auth0: { Auth0Client: class { constructor() { return sdk; } } } };
  globalThis.document = {
    createElement: () => ({}),
    head: { append: script => { calls.push(['script']); script.onload(); } }
  };
  const module = await import('data:text/javascript;base64,' + Buffer.from(source + `\n// ${sequence++}`).toString('base64'));
  return { module, calls, sdk };
}

test('SDK loads lazily and restores a session when no cached user exists', async () => {
  const { module, calls, sdk } = await setup();
  let authenticated = false;
  sdk.isAuthenticated = async () => authenticated;
  sdk.checkSession = async () => { calls.push(['session']); authenticated = true; };
  assert.equal(calls.length, 0);
  assert.equal(await module.initializeAuth(), true);
  assert.equal(await module.accessToken(), 'access-token');
  assert.equal(calls.filter(c => c[0] === 'script').length, 1);
  assert.ok(calls.some(c => c[0] === 'session'));
});

test('reload and Home initialization retain a cached login without silent authentication', async () => {
  for (const route of ['#/trilhas', '#/']) {
    const { module, calls, sdk } = await setup('', route);
    assert.equal(module.authConfig.cacheLocation, 'localstorage');
    sdk.checkSession = async () => { throw new Error('Third-party cookies blocked'); };
    assert.equal(await module.initializeAuth(), true);
    assert.equal(await module.accessToken(), 'access-token');
    assert.equal(calls.some(c => c[0] === 'login' || c[0] === 'logout'), false);
  }
});

test('no cached login and no Auth0 session remains unauthenticated', async () => {
  const { module, sdk } = await setup();
  sdk.isAuthenticated = async () => false;
  assert.equal(await module.initializeAuth(), false);
});

test('callback restores route and removes OAuth parameters', async () => {
  const { module, calls } = await setup('?code=abc&state=xyz');
  await module.initializeAuth();
  assert.equal(calls.find(c => c[0] === 'replace')[3], '/?demo=0#/trilhas');
  assert.equal(calls.some(c => c[0] === 'session'), false);
});

test('callback cannot navigate to an external URL', async () => {
  const { module, calls } = await setup('?code=abc&state=xyz', 'https://untrusted.example');
  await module.initializeAuth();
  assert.equal(calls.find(c => c[0] === 'replace')[3], '/?demo=0#/');
});

test('callback error cleans URL and remains visible to caller', async () => {
  const { module, calls, sdk } = await setup('?error=access_denied&state=xyz');
  sdk.handleRedirectCallback = async () => { throw new Error('access_denied'); };
  await assert.rejects(module.initializeAuth(), /access_denied/);
  assert.equal(calls.find(c => c[0] === 'replace')[3], '/?demo=0#/');
});

test('login remembers API mode and route, logout returns to application', async () => {
  const { module, calls } = await setup();
  await module.login();
  await module.logout();
  assert.deepEqual(calls.find(c => c[0] === 'store'), ['store', 'gamelibrary-demo-mode', 'off']);
  assert.deepEqual(calls.find(c => c[0] === 'login')[1], { appState: { route: '#/trilhas' } });
  assert.equal(calls.find(c => c[0] === 'logout')[1].logoutParams.returnTo, 'http://localhost:5500/');
});

test('expired session reports login recovery', async () => {
  const { module, sdk } = await setup();
  sdk.getTokenSilently = async () => { throw new Error('login_required'); };
  await assert.rejects(module.accessToken(), /Clique em Entrar/);
});
