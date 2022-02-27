import React, {useState, useEffect} from 'react';
import { Switch, Route, Redirect, useHistory } from 'react-router-dom';
import Header from "./Header";
import Main from "./Main";
import Footer from "./Footer";
import PopupWithForm from "./PopupWithForm";
import ImagePopup from "./ImagePopup";
import Register from "./Register";
import Login from "./Login";
import InfoTooltip from "./InfoTooltip";
import ProtectedRoute from './ProtectedRoute.js';
import { api } from '../utils/api';
import EditProfilePopup from "./EditProfilePopup";
import EditAvatarPopup from "./EditAvatarPopup";
import AddPlacePopup from "./AddPlacePopup";
import { CurrentUserContext } from "../contexts/CurrentUserContext";
import auth from '../utils/auth';

const App = () => {

  const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = useState(false);
  const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = useState(false);
  const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [currentUser, setCurrentUser] = React.useState({});
  const [cards, setCards] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [message, setMessage] = useState(false);
  const [isInfoTooltip, setInfoTooltip] = useState(false);
  const history = useHistory();

  const handleEditAvatarClick = () => {
    setIsEditAvatarPopupOpen(true);
  }

  const handleEditProfileClick = () => {
    setIsEditProfilePopupOpen(true);
  }

  const handleAddPlaceClick = () => {
    setIsAddPlacePopupOpen(true);
  }

  const handleCardClick = (card) => {
    setSelectedCard(card);
  }  

  function handleCardLike(card) {
    // Снова проверяем, есть ли уже лайк на этой карточке
    const isLiked = card.likes.some(i => i._id === currentUser._id);
    
    // Отправляем запрос в API и получаем обновлённые данные карточки
    api.changeLikeCardStatus(card._id, !isLiked).then((newCard) => {
        setCards((state) => state.map((c) => c._id === card._id ? newCard : c));
    });
} 

    const handleAddPlaceSubmit = ({name, link}) => {
      api.createCard(name, link)
      .then((data) => {
          setCards([data, ...cards]);
          closeAllPopups();
      })
      .catch((err) => {
          console.log(`ошибка ${err}`);
      });
    }

    const handleCardDelete = (card) => {
      api.deleteCard(card._id)
      .then(() => {
          setCards(cards.filter((c) => c._id !== card._id))
      })
      .catch((err) => {
          console.log(`ошибка ${err}`);
      });
    }

    const handleUpdateAvatar = ({avatar}) => {
      api.saveProfileAvatar(avatar)
          .then((data) => {
              setCurrentUser(data);                
              closeAllPopups();
          })
          .catch((err) => {
              console.log(`ошибка ${err}`);
          })
  }

    const handleUpdateUser = ({name, about}) => {
      api.saveProfile(name, about)
          .then((data) => {
              setCurrentUser(data);
              closeAllPopups();
          })
          .catch((err) => {
              console.log(`ошибка ${err}`);
          })
}


    const handleRegister = (email, password) => {
      auth.signup(password, email)
          .then((res) => {
              setInfoTooltip(true);
              if (res) {
                  setMessage(true);
                  history.push('/sign-in');
              } else {
                  setMessage(false);
              }
          })
    }

    const handleLogin = (email, password) => {
      auth.signin(password, email)
          .then((res) => {
              if (res) {
                  setLoggedIn(true);
                  setUserEmail(email);
                  localStorage.setItem('jwt', res.token);
                  history.push('/');
              } else {
                  setInfoTooltip(true);
                  setMessage(false);
              }
          })
    }

    const handleSignOut = () => {
      localStorage.removeItem('jwt');
      history.push('/sign-in');
    }

    const tokenCheck = () => {
      if (localStorage.getItem('jwt')) {
          const token = localStorage.getItem('jwt');
          if (token) {
              auth.getContent(token)
                  .then((res) => {
                      if (res) {
                          setUserEmail(res.data.email);
                      };
                      setLoggedIn(true);
                      history.push("/");
                  })
          }
      }
    }     

  const closeAllPopups = () => {
    setIsEditAvatarPopupOpen(false);
    setIsEditProfilePopupOpen(false);
    setIsAddPlacePopupOpen(false);
    setSelectedCard(null);
    setInfoTooltip(false);
}

useEffect(() => {
  tokenCheck();
});

useEffect(() => {
  handleUserData();
}, [])

useEffect(() => {
  api.getInitialCards()
      .then((data) => {
          setCards([...data]);
      })
      .catch((err) => { console.log(err) });
  }, []); 

  const handleUserData = () => {
  api.getProfile()
      .then((data) => {
        setCurrentUser(data);
    })
    .catch((err) => {
        console.log(`ошибка ${err}`);
    })
  }

  return (
    <CurrentUserContext.Provider value={currentUser}>
<div className="page">

<Header
  userEmail={userEmail}
  onSignOut={handleSignOut}
/>
<Switch>
<ProtectedRoute
  exact path="/"
  loggedIn={loggedIn}
  component={Main}
  onAddPlace={handleAddPlaceClick}
  onEditAvatar={handleEditAvatarClick}
  onEditProfile={handleEditProfileClick}
  onCardClick={handleCardClick}
  onCardLike={handleCardLike}
  onCardDelete={handleCardDelete}
  cards={cards}
/>

<Route path="/sign-up">
    <Register
        onRegister={handleRegister}
    />
</Route>
<Route path="/sign-in">
    <Login
        onLogin={handleLogin}
    />
</Route>
<Route>
  {loggedIn 
      ? (<Redirect to="/"/>)
      : (<Redirect to="/sign-up"/>)
  }
</Route>
</Switch>
<InfoTooltip
  status={message}
  onClose={closeAllPopups}
  isOpen={isInfoTooltip}
/>
<Footer/>

<PopupWithForm
  title={"Вы уверены?"}
  name={"type_delete"}
  textBtn={"Да"}
  isOpen={false}
  onClose={closeAllPopups}
>
</PopupWithForm>

<EditAvatarPopup isOpen={isEditAvatarPopupOpen} onClose={closeAllPopups} onUpdateAvatar={handleUpdateAvatar}/> 

<EditProfilePopup isOpen={isEditProfilePopupOpen} onClose={closeAllPopups} onUpdateUser={handleUpdateUser}/> 

<AddPlacePopup isOpen={isAddPlacePopupOpen} onClose={closeAllPopups} onAddPlace={handleAddPlaceSubmit} />

<ImagePopup
  card={selectedCard}
  isOpen={selectedCard !== null}
  onClose={closeAllPopups}
/>
</div>
</CurrentUserContext.Provider>
  );
}

export default App;
