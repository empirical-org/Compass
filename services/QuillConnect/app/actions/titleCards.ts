import _ from 'lodash';
import { push } from 'react-router-redux';
import { TitleCardApi } from '../libs/title_cards_api'

const C = require('../constants').default;


function startListeningToTitleCards() {
  return loadTitleCards();
}

function loadTitleCards(): (any) => void {
  return (dispatch) => {
    TitleCardApi.getAll().then((body) => {
      const titleCards = body.title_cards.reduce((obj, item) => {
        return Object.assign(obj, {[item.uid]: item});
      }, {});
      dispatch({ type: C.RECEIVE_TITLE_CARDS_DATA, data: titleCards, });
    });
  };
}

function loadSpecifiedTitleCards(uids) {
  return (dispatch, getState) => {
    const requestPromises: Promise<TitleCardProps>[] = [];
    uids.forEach((uid) => {
      requestPromises.push(TitleCardApi.get(uid));
    });
    const allPromises: Promise<TitleCardProps[]> = Promise.all(requestPromises);
    const questionData = {};
    allPromises.then((results) => {
      results.forEach((result) => {
        questionData[result.uid] = result;
      });
      dispatch({ type: C.RECEIVE_TITLE_CARDS_DATA, data: questionData, });
    });
  }
}

function submitNewTitleCard(content) {
  return (dispatch) => {
    TitleCardApi.create(content).then((body) => {
      dispatch({ type: C.RECEIVE_TITLE_CARDS_DATA_UPDATE, data: {[body.uid]: body} });
      const action = push(`/admin/title-cards/${body.uid}`);
      dispatch(action);
    })
    .catch((body) => {
      dispatch({ type: C.DISPLAY_ERROR, error: `Submission failed! ${body}`, });
    });
  };
}

function submitTitleCardEdit(uid, content) {
  return (dispatch, getState) => {
    TitleCardApi.update(uid, content).then((body) => {
      dispatch({ type: C.RECEIVE_TITLE_CARDS_DATA_UPDATE, data: {[body.uid]: body} });
      dispatch({ type: C.DISPLAY_MESSAGE, message: 'Update successfully saved!', });
      const action = push(`/admin/title-cards/${uid}`);
      dispatch(action);
    }).catch((body) => {
      dispatch({ type: C.DISPLAY_ERROR, error: `Update failed! ${body}`, });
    });
  };
}

export {
  submitNewTitleCard,
  loadTitleCards,
  loadSpecifiedTitleCards,
  startListeningToTitleCards,
  submitTitleCardEdit,
}
