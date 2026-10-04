import "./Profile.css";

function Profile() {
  // Temporary frontend data.
  // Later, backend data can be passed here.
  const user = {
    name: "Student Name",
    username: "@student",
    description:
      "Computer Science student who enjoys learning, creating and sharing useful study notes.",
    course: "B.Sc. Computer Science",
    semester: "Semester 5",
    college: "College Name",
    department: "Computer Science",
    joinedDate: "September 2026",
    notesShared: 24,
    totalViews: 1250,
    totalDownloads: 486,
    totalLikes: 328,
  };

  const recentNotes = [
    {
      title: "Object Oriented Programming",
      subject: "Programming",
      views: 124,
      downloads: 48,
    },
    {
      title: "Data Structures",
      subject: "Computer Science",
      views: 98,
      downloads: 36,
    },
    {
      title: "Operating Systems",
      subject: "Operating System",
      views: 76,
      downloads: 29,
    },
    {
      title: "Database Management System",
      subject: "Database",
      views: 64,
      downloads: 21,
    },
  ];

  return (
    <div className="profile-page">

      {/* Profile Header */}
      <div className="profile-header">

        <div className="profile-avatar">
          {user.name.charAt(0)}
        </div>

        <div className="profile-main-info">
          <h1>{user.name}</h1>

          <p className="username">
            {user.username}
          </p>

          <p className="profile-description">
            {user.description}
          </p>

          <div className="profile-course">
            {user.course}
          </div>
        </div>

      </div>

      {/* Basic Details */}
      <div className="profile-section">

        <h2>Basic Details</h2>

        <div className="details-grid">

          <div className="detail-card">
            <span>Course</span>
            <strong>{user.course}</strong>
          </div>

          <div className="detail-card">
            <span>Semester</span>
            <strong>{user.semester}</strong>
          </div>

          <div className="detail-card">
            <span>College</span>
            <strong>{user.college}</strong>
          </div>

          <div className="detail-card">
            <span>Department</span>
            <strong>{user.department}</strong>
          </div>

          <div className="detail-card">
            <span>Joined</span>
            <strong>{user.joinedDate}</strong>
          </div>

        </div>

      </div>

      {/* Statistics */}
      <div className="profile-section">

        <h2>Contribution</h2>

        <div className="stats-grid">

          <div className="stat-card">
            <div className="stat-number">
              {user.notesShared}
            </div>
            <div className="stat-label">
              Notes Shared
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-number">
              {user.totalViews}
            </div>
            <div className="stat-label">
              Total Views
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-number">
              {user.totalDownloads}
            </div>
            <div className="stat-label">
              Downloads
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-number">
              {user.totalLikes}
            </div>
            <div className="stat-label">
              Likes
            </div>
          </div>

        </div>

      </div>

      {/* Recent Notes */}
      <div className="profile-section">

        <div className="section-heading">
          <h2>Recent Notes</h2>

          <button className="view-all-btn">
            View All Notes
          </button>
        </div>

        <div className="notes-list">

          {recentNotes.map((note, index) => (
            <div className="profile-note-card" key={index}>

              <div className="note-info">

                <h3>{note.title}</h3>

                <p>{note.subject}</p>

              </div>

              <div className="note-stat">
                👁 {note.views}
              </div>

              <div className="note-stat">
                ↓ {note.downloads}
              </div>

            </div>
          ))}

        </div>

      </div>

    </div>
  );
}

export default Profile;