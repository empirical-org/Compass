'use strict'
 import React from 'react'
import createReactClass from 'create-react-class'

 export default createReactClass({
  render: function() {
    return (
        <a href='/teachers/classrooms/new'>
          <div className="dashed">
            <img className='plus-icon' src='/add_class.png'></img>
            <h3>Add a Class</h3>
            </div>
        </a>
    );
  }

});
