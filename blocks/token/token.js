import { div } from '../../scripts/dom-helpers.js';

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
          div(data.email),
          div(data['x-auth-token'])
        )
      ))
    )
  );
}