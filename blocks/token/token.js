import { div } from '../../scripts/dom-helpers.js';

function displayToken(token) {
  if (!token) return '';
  let parts = token.split('.');
  parts = parts.map((part) => part.substring(0, 10) + '...');
  return parts.join('.');
}

export default async function decorate(block) {
  const orgs = [
    'adobe',
    'aemsites',
    'hlxsites',
  ];

  const orgsdata = [];
  await Promise.allSettled(orgs.map(async (org) => {
    const res = await fetch(`https://admin.hlx.page/profile/${org}/?reveal_token=true`);
    if (!res.ok) return;
    const data = await res.json();
    orgsdata.push({ org, ...data});
  }));

  block.append(
    div({ class: 'container'},
      div({ class: 'row header'},
        div('Organization'),
        div('Email'),
        div('Token'),
      ),
      ...orgsdata.map((data) => (
        div({ class: 'row'},
          div(data.org),
          div(data.profile?.email),
          div(displayToken(data.profile?.['x-auth-token'])),
        )
      ))
    )
  );
}