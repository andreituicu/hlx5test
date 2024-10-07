import { loadScript } from '../../scripts/aem.js';

export default function decorate(block) {
  loadScript('https://first-worker.andrei-tuicu.workers.dev/scripts/test.js');
  const image = document.createElement('img');
  image.src = block.querySelector('a').href;
  block.innerHTML = '';
  block.appendChild(image);
}