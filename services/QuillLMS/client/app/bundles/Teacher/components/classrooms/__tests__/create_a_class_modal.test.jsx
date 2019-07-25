import React from 'react';
import { shallow } from 'enzyme';

import CreateAClassModal from '../create_a_class_modal.tsx';
import CreateAClassForm from '../create_a_class_form'
import AddStudents from '../add_students'
import SetupInstructions from '../setup_instructions'

describe('CreateAClassModal component', () => {

  describe('step 1', () => {
    const wrapper = shallow(
      <CreateAClassModal showSnackbar={() => {}} close={() => {}} />
    );

    it('should render create a class form', () => {
      expect(wrapper.find(CreateAClassForm).exists()).toBe(true);
    })

    it('should have step 1 active in the navigation', () => {
      expect(wrapper.find('.active').text()).toMatch('1. Create a class')
    })
  })

  describe('step 2', () => {

    const wrapper = shallow(
      <CreateAClassModal showSnackbar={() => {}} close={() => {}} />
    );

    wrapper.setState({ step: 2})

    it('should render add students', () => {
      expect(wrapper.find(AddStudents).exists()).toBe(true);
    })

    it('should have step 2 active in the navigation', () => {
      expect(wrapper.find('.active').text()).toMatch('2. Add students')
    })
  })

  describe('step 3', () => {

    const wrapper = shallow(
      <CreateAClassModal showSnackbar={() => {}} close={() => {}} />
    );

    wrapper.setState({ step: 3})

    it('should render add students', () => {
      expect(wrapper.find(SetupInstructions).exists()).toBe(true);
    })

    it('should have step 3 active in the navigation', () => {
      expect(wrapper.find('.active').text()).toMatch('3. Setup instructions')
    })
  })

});
