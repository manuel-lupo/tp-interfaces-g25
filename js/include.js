const firstImage = document.querySelector('.first-image img');
const thumbnails = document.querySelectorAll('.thumbnails img');
const arrowLeft = document.querySelector('.arrow-left');
const arrowRight = document.querySelector('.arrow-right');

const thumbArray = Array.from(thumbnails);
let currentIndex = 0;

function showImage(i){
  if (i < 0) i = thumbArray.length - 1;
  if (i >= thumbArray.length) i = 0;

  let newImage = thumbArray[i].getAttribute('src');
  firstImage.setAttribute('src', newImage);

  thumbArray.forEach(thumb => thumb.classList.remove('active'));
  thumbArray[i].classList.add('active');

  currentIndex = i;
}

arrowLeft.addEventListener('click', () => {
  showImage(currentIndex - 1);
});

arrowRight.addEventListener('click', () => {
  showImage(currentIndex + 1);
});

thumbArray.forEach((thumb, index) => {
  thumb.addEventListener('click', () => showImage(index));
});

showImage(currentIndex);