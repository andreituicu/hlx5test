export default function decorate(block) {
  const image = document.createElement('img');
  image.src = block.querySelector('a').href;
  block.innerHTML = '';
  block.appendChild(image);
}