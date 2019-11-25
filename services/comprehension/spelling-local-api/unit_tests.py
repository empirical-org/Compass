from mock import Mock, patch
from unittest import TestCase
import flask
import pytest
import main
from flask import json


# Create a fake "app" for generating test request contexts.
@pytest.fixture(scope="module")
def app():
    return flask.Flask(__name__)

def mock_response_for(label_dict):
    mock_response = Mock()
    payload = []

    for label, score in label_dict.items():
      mock = Mock(display_name=label, classification=Mock(score=score))
      payload.append(mock)

    mock_response.payload = payload

    return mock_response

def test_http_response(app):
    with app.test_request_context(json={'entry': 'This is spelled correctly.', 'prompt_id': None}):
      response = main.response_endpoint(flask.request)
      data = json.loads(response.data)

      assert response.status_code == 400


def test_correct_spelling():
    misspelled = main.get_misspelled_words_no_casing('This is spelled correctly.')
    assert len(misspelled) == 0

def test_incorrect_spelling_single_error_middle_of_sentence():
    misspelled = main.get_misspelled_words_no_casing('This is spellllled correctly.')
    assert len(misspelled) == 1
    assert 'spellllled' in misspelled

def test_incorrect_spelling_single_error_end_of_sentence():
    misspelled = main.get_misspelled_words_no_casing('This is spelled incorrectlee.')
    assert len(misspelled) == 1
    assert 'incorrectlee' in misspelled

def test_incorrect_spelling_single_error_beginning_of_sentence():
    misspelled = main.get_misspelled_words_no_casing('Thissss is spelled incorrectly.')
    assert len(misspelled) == 1
    assert 'thissss' in misspelled

def test_incorrect_spelling_multiple_errors():
    misspelled = main.get_misspelled_words_no_casing('Thissss is spellllled incorrectlee.')
    assert len(misspelled) == 3
    assert 'thissss' in misspelled
    assert 'spellllled' in misspelled
    assert 'incorrectlee' in misspelled

def test_casing():
    flagged = ['thissss', 'spEled']
    entry = 'Thissss is spEled incorrectly.'
    highlight = main.get_misspelled_highlight_list_with_casing(flagged, entry)
    assert len(highlight) == 2
    assert highlight[0]['text'] == 'Thissss'
    assert highlight[1]['text'] == 'spEled'
    