import { div } from '../../scripts/dom-helpers.js';

function displayToken(token) {
  if (!token) return '';
  let parts = token.split('.');
  parts = parts.map((part) => part.substring(0, 10) + '...');
  return parts.join('.');
}

export default async function decorate(block) {
  const res = await fetch(`https://admin.hlx.page/profile/?reveal_token=true`, { method: "GET", credentials: "include" });
  if (!res.ok) {
    block.append(div({ class: 'error' }, 'You are not logged into Helix Admin or you don\'t have third party cookies enabled.'));
    return;
  }

  const data = await res.json(); 

  block.append(
    div({ class: 'container'},
      div({ class: 'row header'},
        div('Email'),
        div('Token'),
      ),
      div({ class: 'row'},
        div(data.profile?.email),
        div(displayToken(data.profile?.['x-auth-token'])),
      )
    )
  );
}