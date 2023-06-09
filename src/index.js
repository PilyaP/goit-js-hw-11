import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import SearchPhotos from './js/api';
import renderPhoto from './js/renderPhoto';

const searchFormEl = document.querySelector('.js-search-form');
const gallery = document.querySelector('.gallery');

const searchPhotos = new SearchPhotos();
const lightbox = new SimpleLightbox('.gallery a', {
  captionsData: "alt",
  captionDelay: 250,
});

let isLoading = false;
let page = 1;
const perPage = 40;

searchFormEl.addEventListener('submit', handleSearchSubmit);

function handleSearchSubmit(event) {
  event.preventDefault();

  const searchQuery = event.currentTarget.elements.searchQuery.value.trim();

  if (searchQuery === '') {
    Notify.warning('Please enter a word or phrase to search for pictures.');
    return;
  }

  searchPhotos.resetPage();
  searchPhotos.query = searchQuery;
  clearGallery();
  loadPhotos();
}

async function loadPhotos() {
  if (isLoading) {
    return;
  }

  isLoading = true;

  try {
    const photoGallery = await searchPhotos.getGallery({ page, per_page: perPage });
    const totalHits = photoGallery.totalHits;

    if (totalHits === 0) {
      Notify.failure('Sorry, there are no images matching your search query. Please try again.');
      return;
    }

    if (page === 1) {
      Notify.success(`Hooray! We found ${totalHits} images.`);
    }

    const photoHits = photoGallery.hits;
    photoHits.forEach(photoHit => {
      renderPhoto(photoHit);
    });

    lightbox.refresh();

    if (totalHits / perPage <= page) {
      Notify.warning(`We're sorry, but you've reached the end of the search results.`);
      window.removeEventListener('scroll', handleInfiniteScroll);
    }
  } catch (error) {
    Notify.failure(`An error has occurred: ${error}`);
  }

  isLoading = false;
}

function clearGallery() {
  gallery.innerHTML = '';
}

function handleInfiniteScroll() {
  const scrollTop = document.documentElement.scrollTop;
  const clientHeight = window.innerHeight;
  const scrollHeight = document.body.offsetHeight;

  if (scrollTop + clientHeight >= scrollHeight && !isLoading) {
    page++;
    loadPhotos();
  }
}

function resetPage() {
  page = 1;
}

window.addEventListener('scroll', handleInfiniteScroll);
