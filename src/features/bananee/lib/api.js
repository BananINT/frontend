export function apiBase(){
  const host = location.hostname;
  return `${location.protocol}//${host}/api/admin/bananee`;
}

export function wsUrl(){
  const proto = location.protocol === 'https:' ? 'wss' : 'ws';
  return `${proto}://${location.hostname}/api/bananee/ws`;
}
