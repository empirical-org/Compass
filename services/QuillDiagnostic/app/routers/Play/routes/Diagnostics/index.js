import { Passthrough } from 'quill-component-library/dist/componentLibrary';
import { getParameterByName } from 'libs/getParameterByName';

const diagnosticRoute = {
  path: ':diagnosticID',
  getComponent: (nextState, cb) => {
    import(/* webpackChunkName: "student-diagnostic" */ 'components/shared/diagnosticRouter.tsx')
    .then((component) => {
      cb(null, component.default);
    });
  },
};

const indexRoute = {
  component: Passthrough,
  onEnter: (nextState, replaceWith) => {
    const lessonID = getParameterByName('uid');
    const studentID = getParameterByName('student');
    if (lessonID) {
      document.location.href = `${document.location.origin + document.location.pathname}#/play/diagnostic/${lessonID}?student=${studentID}`;
    }
  },
};

const route = {
  path: 'diagnostic',
  indexRoute,
  childRoutes: [
    diagnosticRoute
  ],
  component: Passthrough,
};

export default route;
