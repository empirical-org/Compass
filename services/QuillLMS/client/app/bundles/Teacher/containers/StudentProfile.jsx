import React from 'react';
import StudentsClassroomsHeader from '../components/student_profile/students_classrooms/students_classrooms_header.jsx';
import NextActivity from '../components/student_profile/next_activity.jsx';
import NotificationFeed  from '../components/student_profile/notification_feed';
import StudentProfileUnits from '../components/student_profile/student_profile_units.jsx';
import StudentProfileHeader from '../components/student_profile/student_profile_header';
import SelectAClassroom from '../../Student/components/selectAClassroom'
import Pusher from 'pusher-js';
import { connect } from 'react-redux';
import {
  fetchNotifications,
  fetchStudentProfile,
  fetchStudentsClassrooms,
  updateNumberOfClassroomTabs,
  handleClassroomClick,
  hideDropdown,
  toggleDropdown
} from '../../../actions/student_profile';

class StudentProfile extends React.Component {
  constructor(props) {
    super(props);

    this.handleClassroomTabClick = this.handleClassroomTabClick.bind(this);
    this.initializePusher = this.initializePusher.bind(this);
  }

  componentDidMount() {
    const {
      updateNumberOfClassroomTabs,
      fetchNotifications,
      fetchStudentProfile,
      fetchStudentsClassrooms,
      classroomId,
    } = this.props;

    if (classroomId) {
      handleClassroomClick(classroomId);
      fetchStudentProfile(classroomId);
      fetchStudentsClassrooms();
    } else {
      fetchStudentProfile();
      fetchStudentsClassrooms();
    }

    // Remove following conditional when student notifications are ready to display
    const displayFeature = false;
    if (displayFeature) {
      fetchNotifications();
    }

    window.addEventListener('resize', () => {
      updateNumberOfClassroomTabs(window.innerWidth);
    });
    updateNumberOfClassroomTabs(window.innerWidth);
  }

  componentWillReceiveProps(nextProps) {
    const { selectedClassroomId, router, } = this.props
    if (nextProps.selectedClassroomId !== selectedClassroomId) {
      if (!window.location.href.includes(nextProps.selectedClassroomId)) {
        router.push(`classrooms/${nextProps.selectedClassroomId}`);
      }
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize');
  }

  handleClassroomTabClick(classroomId) {
    const { loading, handleClassroomClick, fetchStudentProfile, history, router, } = this.props;

    if (!loading) {
      const newUrl = `/classrooms/${classroomId}`;
      router.push(newUrl);
      handleClassroomClick(classroomId);
      fetchStudentProfile(classroomId);
    }
  }

  initializePusher() {
    const { student, fetchStudentProfile, } = this.props;

    if (student) {
      const classroomId = student.classroom.id;

      if (process.env.RAILS_ENV === 'development') {
        Pusher.logToConsole = true;
      }
      const pusher = new Pusher(process.env.PUSHER_KEY, { encrypted: true, });
      const channel = pusher.subscribe(classroomId.toString());
      channel.bind('lesson-launched', () => {
        fetchStudentProfile(classroomId);
      });
    }
  }

  render() {
    const {
      classrooms,
      notifications,
      numberOfClassroomTabs,
      student,
      selectedClassroomId,
      hideDropdown,
      toggleDropdown,
      showDropdown,
      nextActivitySession,
      loading,
      scores,
    } = this.props;

    if (loading) { return <span /> }

    if (!selectedClassroomId) { return (<SelectAClassroom classrooms={classrooms} onClickCard={this.handleClassroomTabClick} />)}

    const nextActivity = nextActivitySession ? (<NextActivity
      activityClassificationId={nextActivitySession.activity_classification_id}
      activityId={nextActivitySession.activity_id}
      caId={nextActivitySession.ca_id}
      hasActivities={scores.length > 0}
      loading={loading}
      maxPercentage={nextActivitySession.max_percentage}
      name={nextActivitySession.name}
    />) : null;

    // <StudentsClassroomsHeader
    //   classrooms={classrooms}
    //   handleClick={this.handleClassroomTabClick}
    //   hideDropdown={hideDropdown}
    //   numberOfClassroomTabs={numberOfClassroomTabs}
    //   selectedClassroomId={selectedClassroomId}
    //   showDropdown={showDropdown}
    //   toggleDropdown={toggleDropdown}
    // />

    return (<div id="student-profile">
      <StudentProfileHeader
        classroomName={student.classroom.name}
        studentName={student.name}
        teacherName={student.classroom.teacher.name}
      />
      <NotificationFeed notifications={notifications} />
      {nextActivity}
      <StudentProfileUnits
        data={scores}
        loading={loading}
      />
    </div>);
  }
}

const mapStateToProps = state => state;
const mapDispatchToProps = dispatch => ({
  fetchNotifications: () => dispatch(fetchNotifications()),
  fetchStudentProfile: classroomId => dispatch(fetchStudentProfile(classroomId)),
  updateNumberOfClassroomTabs: screenWidth => dispatch(updateNumberOfClassroomTabs(screenWidth)),
  fetchStudentsClassrooms: () => dispatch(fetchStudentsClassrooms()),
  handleClassroomClick: classroomId => dispatch(handleClassroomClick(classroomId)),
  hideDropdown: () => dispatch(hideDropdown()),
  toggleDropdown: () => dispatch(toggleDropdown()),
});

export default connect(mapStateToProps, mapDispatchToProps)(StudentProfile);
