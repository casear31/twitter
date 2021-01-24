


class FetchData {  //класс для сервера, для работы с простой открытой API 
    getResourse = async url => { //Data
        const res = await fetch(url); // promise {<pending>} ожидание status: "fulfilled" и ok == true

        if (!res.ok) { //обработка ошибок
            throw new Error('Произошла ошибка' + res.status)
        }
                            //обрабатывает и возвращает полученный промис, есть ещё метод text.
        return res.json(); //обязательно должен быть хотя бы один из методов для обработки информации
    } 

    getPost = () => this.getResourse('./db/dataBase.json'); // путь ведется от index.html
}


//класс самого приложения
class Twitter {  
    constructor({
        user,
        listElem,
        modalElems,
        tweetElems,
        headerAv,
        classDeleteTweet,
        classLikeTweet,
        sortElem,
        showUserPostElem,
        showLikedPostElem
    }) {
        const fetchData = new FetchData();  //обращаемся к базе
        this.user = user;
        this.tweets = new Posts();
        this.elements = {
            listElem: document.querySelector(listElem),
            sortElem: document.querySelector(sortElem),
            modal: modalElems,
            tweetElems,
            headerAv: document.querySelector(headerAv),
            showUserPostElem: document.querySelector(showUserPostElem),
            showLikedPostElem: document.querySelector(showLikedPostElem),
        }
        this.class = {
            classDeleteTweet,
            classLikeTweet
        }
        this.sortDate = true;

        fetchData.getPost()
            .then(data => {

                data.forEach(this.tweets.addPost) //прогоняем все посты через Posts.AddPost()
                this.showAllPost()
            })
        
        this.elements.modal.forEach(this.handlerModal, this);
        this.elements.tweetElems.forEach(this.addTweet, this);
        this.elements.headerAv.src = `./images/${this.user.avImg}`;
        this.elements.listElem.addEventListener('click', this.handlerTweet);
        this.elements.sortElem.addEventListener('click', this.changeSort);
        this.elements.showLikedPostElem.addEventListener('click', this.showLikesPost);
        this.elements.showUserPostElem.addEventListener('click', this.showUserPost);
    
    }

    renderPosts(posts) {  //отображение всех постов
        const sortPost = posts.sort(this.sortFields());
        this.elements.listElem.textContent = '';

        sortPost.forEach(({ id,
            userName,
            avatar,
            nickName,
            text,
            img,
            likes,
            getDate,
            liked
        }) => {
            this.elements.listElem.insertAdjacentHTML('beforeend', `
            <li>
                <article class="tweet">
                    <div class="row">
                        <img class="avatar" src="./images/${avatar}" alt="Аватар пользователя ${nickName}">
                        <div class="tweet__wrapper">
                            <header class="tweet__header">
                                <h3 class="tweet-author">${userName}
                                    <span class="tweet-author__add tweet-author__nickname">@${nickName}</span>
                                    <time class="tweet-author__add tweet__date">${getDate()}</time>
                                </h3>
                                <button class="tweet__delete-button chest-icon" data-id="${id}"></button>
                            </header>
                            <div class="tweet-post">
                                <p class="tweet-post__text">${text}</p>
                                ${
                                    img ?
                                    
                                `<figure class="tweet-post__image">
                                    <img src="${img}" alt="иллюстрация из поста ${nickName}" >
                                </figure> ` : ''
                                }
                            </div>
                        </div>
                    </div>
                    <footer>
                        <button class="tweet__like ${liked ? this.class.classLikeTweet.active : ''}" 
                        data-id="${id}">
                            ${likes}
                        </button>
                    </footer>
                </article>
            </li>
            `); //верстка в скобках указывается позиция куда вставлять
        })

    }

showUserPost = () => { //все посты пользователя
    const post = this.tweets.posts.filter(item => item.nickName === this.user.nick);
    this.renderPosts(post);

    }

    showLikesPost = () => { // показать понравившиеся посты
        const post = this.tweets.posts.filter(item => item.liked);
        this.renderPosts(post)
    }

    showAllPost = () => {  //показать все посты
        this.renderPosts(this.tweets.posts);
    }

    //обработчик модального окна
    handlerModal({ button, modal, overlay, close }) { //получаем элементы со страницы
        const buttonElem = document.querySelector(button);
        const modalElem = document.querySelector(modal);
        const overlayElem = document.querySelector(overlay);
        const closeElem = document.querySelector(close);

        // открываем модальное окно
        const openModal = () => {
            modalElem.style.display = 'block';
        }

        //  закрываем модальное окно
        const closeModal = (elem, event) => {
            const target = event.target;
            if (target === elem) {
                modalElem.style.display = 'none';
            }
        }

        buttonElem.addEventListener('click', openModal);

        if (closeElem) {
            closeElem.addEventListener('click', closeModal.bind(null, closeElem));
        }
        
        if (overlayElem) {
            overlayElem.addEventListener('click', closeModal.bind(null, overlayElem));
        }

        this.handlerModal.closeModal = () => {
            modalElem.style.display = 'none';
        }

    }

    //добавление самого твита: текст, картинка + обработка автарки и кнопки-сабмита
    addTweet({ userAv, text, img, submit  }) { 
        const textElem = document.querySelector(text);
        const imgElem = document.querySelector(img);
        const submitElem = document.querySelector(submit);
        const userAvElem = document.querySelector(userAv);

        userAvElem.src = `./images/${this.user.avImg}`; //аватар

        let imgUrl = '';

        let tempString = textElem.innerHTML;


        submitElem.addEventListener('click', () => { //отправить пост
            this.tweets.addPost({
                userName: this.user.name,
                nickName: this.user.nick,
                text: textElem.innerHTML, 
                img: imgUrl,
                avatar: this.user.avImg
            })
            this.showAllPost();
            this.handlerModal.closeModal();
            textElem.innerHTML = tempString;
        })

        textElem.addEventListener('click', () => {
            if (textElem.innerHTML === tempString) {
                textElem.innerHTML = '';
            }
        })

        imgElem.addEventListener('click', () => {
            imgUrl = prompt('введите адрес картинки!')
        })
    }

    handlerTweet = (event) => {
        const target = event.target;
        if (target.classList.contains(this.class.classDeleteTweet)) {
            this.tweets.deletePost(target.dataset.id); //data-id без слова дата 
            this.showAllPost();
        }

        if (target.classList.contains(this.class.classLikeTweet.like)) {
            this.tweets.likePost(target.dataset.id);
            this.showAllPost();
        }
            
    }
    changeSort = () => {
        this.sortDate = !this.sortDate;
        this.showAllPost();
    }

    sortDate
    sortFields() {
        if (this.sortDate) {
            return (a, b) => {
                const dateA = new Date(a.postDate);
                const dateB = new Date(b.postDate);
                return dateB - dateA;
            }
        } else {
            return (a, b) => b.likes - a.likes;
        }
    }


}

//класс, добавляющий методы для работы с постом
class Posts {   
    constructor({ posts =  [] } = {}) { //необязательный параметр, во избежание ошибки
        this.posts = posts;
    }

    addPost = (tweets) => {   //добавить пост
        this.posts.push(new Post(tweets));
    }

    deletePost(id) {  //удалить пост
        this.posts = this.posts.filter(item => item.id !==id)
    }

    likePost(id) {  //лайкнуть пост
        this.posts.forEach(item => {
            if (item.id === id) {
                item.changeLike();
            }
        })
    }
}

//класс для создания поста
class Post {  
    constructor({ id, userName, avatar = 'tempAv.jpg' , nickName, text, postDate, img, likes = 0 }) {  //деконструктуируем
        this.id = id || this.generateId();  //если первый id вернет тру, то вернет его, если нет переход к следующему
        this.userName = userName;
        this.avatar = avatar; //Если у юзера нет автара, будет отражаться лицо со знаком вопроса
        this.nickName = nickName;
        this.postDate = postDate ? this.correctDate(postDate) : new Date();
        this.text = text;
        this.img = img;
        this.likes = likes;
        this.liked = false;
    }

    changeLike() {   //  поставить или удалить лайк, будет использоваться методом likePost(id)
        this.liked = !this.liked;
        if (this.liked) {
            this.likes++;
        } else {
            this.likes--;
        }
    }

    generateId() {
        return Math.random().toString(32).substring(2, 9) + (new Date).toString(32); //создаём уникальный айди 
    }

    getDate = () => {  //Преобразование даты в красивый вид (сначала была обычная, потом поменяли на стрелочную)
        const options = {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }
        return this.postDate.toLocaleString('ru-RU', options)
    }

    correctDate(date) {
        if (isNaN(Date.parse(date))) {
            date = date.replace(/\./g, '/')
            date = date.replaceAll()
        }
        return new Date(date);
    }
}

// вызов твиттера передаём аргументы свойства
const twitter = new Twitter({  
    listElem: '.tweet-list',
    user: {
        name: 'Вы',
        nick: 'whySoSerious',
        avImg: 'userAv.jpg'
    },
    headerAv: '.header .avatar', //главный аватар
    modalElems: [ //для работы модального
        {
            button: '.header__link_tweet',
            modal: '.modal',
            overlay: '.overlay',
            close: '.modal-close__btn',
        }
    ],
    tweetElems: [  //для твита из модального окна
        {
            userAv: '.modal .tweet-form__avatar',
            text: '.modal .tweet-form__text',
            img: '.modal .tweet-img__btn',
            submit: '.modal .tweet-form__btn',
        },
        {
            userAv: '.wrapper .tweet-form__avatar',
            text: '.wrapper .tweet-form__text',
            img: '.wrapper .tweet-img__btn',
            submit: '.wrapper .tweet-form__btn',
        }
    ],
    classDeleteTweet: 'tweet__delete-button',
    classLikeTweet: {
        like: 'tweet__like',
        active: 'tweet__like_active'
    },
    sortElem: '.header__link_sort',
    showUserPostElem: '.header__link_profile',
    showLikedPostElem: '.header__link_likes'
})


