'use strict';
const selectors = {
  tagItem: '.tag__box',
  active: 'active',
  popupCity: '.popup__city',
  tagCity: '.tag__city'
}

const popup = document.querySelector('.popup');
const template = document.querySelector('#city').content;
const tagTemplate = document.querySelector('#tag').content;
const cityName = document.querySelector('.header__city');
const cityList = document.querySelector('.popup__scroll');
const buttonSave = document.querySelector('.popup__button-save');
const popupInput = popup.querySelector('.popup__input');
const tagBox = popup.querySelector('.popup__box');
const inputClearButton = popup.querySelector('.popup__input-clear-button');
const postUrl = 'https://studika.ru/api/areas';
const postOptions = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
}

let regionList;

inputClearButton.addEventListener('click', () => {
  popupInput.value = '';
})

function handleCityItemClick(name) {
  const elements = tagBox.querySelectorAll(selectors.tagItem);
  const currentName = Array.from(elements).find(i => i.innerText === name)
  if (elements.length === 0) {
    tagBox.append(createTagItem(name));
  }
  if (elements.length !== 0) {
    elements.forEach((element) => {
      if (element.innerText === name) {
        element.remove();
      }
    })
  }
  if (!currentName && elements.length !== 0) {
    tagBox.append(createTagItem(name));
  }
}

function handleCloseTag(e) {
  e.target.closest(selectors.tagItem).remove();
}

popupInput.addEventListener('input', (e) => {
  const value = e.target.value;
  if (value) {
    inputClearButton.classList.add(selectors.active);
  }
  if (!value) {
    inputClearButton.classList.remove(selectors.active);
  }
  const list = document.querySelectorAll(selectors.popupCity);
  const regex = new RegExp(value, 'gi')
  list.forEach((item) => {
    if (regex.test(item.textContent)) {
      item.scrollIntoView({
        block: 'start',
        behavior: 'smooth'
      })
    }
  })
  list.forEach((item) => {
    const start = item.textContent.substring(0, value.length)
    const end = item.textContent.substring(value.length)
    item.innerHTML = `<span class="text">${start}</span>` + end
    if (!regex.test((item.textContent))) {
      item.innerHTML = `<span>${start}</span>` + end
    }
  })
})

function handleClickForClosePopup(e) {
  if (!e.target.className.includes('popup') && !e.target.className.includes('tag')) {
    closePopup();
  }
}

function openPopup() {
  popup.classList.add('popup_opened');
  document.addEventListener('mousedown', handleClickForClosePopup)
}

function closePopup() {
  popup.classList.remove('popup_opened');
  document.removeEventListener('mousedown', handleClickForClosePopup);
  cityName.removeEventListener('click', getCityList)
  popupInput.value = '';
  cityList.innerHTML = '';

}

buttonSave.addEventListener('click', (e) => {
  handleButtonSubmit(e)
})

function handleButtonSubmit(e) {
  e.preventDefault();
  const elements = Array.from(tagBox.querySelectorAll(selectors.tagCity)).map((element) => {
    return element.textContent
  });
  setCookie('elements', JSON.stringify(elements))
  sendCityList(elements)
  closePopup();
}

function sendCityList(data) {
  const url = `https://reqbin.com/echo/post/json`
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  }
  request(url, options)
    .then((res) => res.json())
    .catch(err => console.warn(err))
}

function createCityItem(name) {
  const cityItem = template.cloneNode(true).querySelector(selectors.popupCity);
  cityItem.addEventListener('click', () => {
    handleCityItemClick(name)
  })
  cityItem.textContent = name
  return cityItem;
}

function createTagItem(name) {
  const tagItem = tagTemplate.cloneNode(true).querySelector(selectors.tagItem);
  const tagName = tagItem.querySelector(selectors.tagCity);
  tagName.textContent = name;
  const button = tagItem.querySelector('.tag__close-button');

  button.addEventListener('click', (e) => {
    handleCloseTag(e)
  })
  return tagItem;
}

cityName.addEventListener('click', () => {
  openPopup();
  renderCityList();
})

cityName.addEventListener('click', getCityList)

function request(url, options) {
  return fetch(url, options)
}

function getCityList() {
  waitResponse()
  request(postUrl, postOptions)
    .then((res) => {
      waitResponse()
      return res.json()
    })

    .then((data) => {
      regionList = data;
      fullResponse()
    })
    .then(() => renderCityList())
    .catch(err => console.warn(err))
}

function renderCityList() {
  if (regionList) {
    regionList.map((element) => {
      const { name } = element;
      cityList.append(createCityItem(name));
    })
  }
}

function setCookie(name, value, options = {}) {
  options = {
    path: '/',
    ...options
  };

  if (options.expires instanceof Date) {
    options.expires = options.expires.toUTCString();
  }

  let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);

  for (let optionKey in options) {
    updatedCookie += "; " + optionKey;
    let optionValue = options[optionKey];
    if (optionValue !== true) {
      updatedCookie += "=" + optionValue;
    }
  }

  document.cookie = updatedCookie;
}

function waitResponse() {
  buttonSave.textContent = `Ожидание...`
}

function fullResponse() {
  buttonSave.textContent = `СОХРАНИТЬ`
}
