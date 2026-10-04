import { useEffect, useState } from "react";
import "./dash.css";
import AddNotes from "./components/addnotes";
import MyNotes from "./components/Mynotes";
import NoteView from "./components/notesCard";
import { getNotes, deleteNote } from "./api";
import { useAuth } from "./context/AuthContext";
import {
  FaBell, FaUserCircle, FaChevronDown, FaPaperPlane,
  FaStar, FaRegBookmark, FaRegHeart, FaRegComment,
} from "react-icons/fa";
import BannerImg from "./assets/BannerNoteApp.png";

const categories = [
  ["All Notes", 124],
  ["Computer Science", 32],
  ["MCA", 18],
  ["BCA", 6],
  ["Cloud Computing", 14],
  ["DevOps / Linux", 12],
  ["Projects", 9],
  ["Study Material", 8],
  ["Other", 5],
];

function Dashboard() {
  const { user, logout } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [catOpen, setCatOpen] = useState(false);
  const [activeCat, setActiveCat] = useState("All Notes");
  const [unread] = useState(3);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [showMyNotes, setShowMyNotes] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError("");
    getNotes()
      .then((nextNotes) => {
        if (active) setNotes(nextNotes);
      })
      .catch((error) => {
        if (active) setLoadError(error.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user?.uid]);

  const query = search.trim().toLowerCase();

  const filteredNotes = notes.filter((n) =>
    [n.topic, n.ownerName, n.info, ...(n.tags || [])].join(" ").toLowerCase().includes(query)
  );

  // only the notes owned by the logged in user
  const myNotes = notes.filter((n) => n.ownerId === user.uid);

  const addNote = (note) => {
    setNotes((prev) => [note, ...prev]); // new note goes first
    setShowAdd(false);
  };

  const handleDelete = async (note) => {
    await deleteNote(note);
    setNotes((prev) => prev.filter((n) => n.id !== note.id));
  };

  const handleViewFromMyNotes = (note) => {
    setShowMyNotes(false);
    setSelected(note);
  };

  return (
    <div className="dash">
      {/* navbar */}
      <div className="navbar">
        <div className="symbol">NotesBhejde</div>
        <div className="searchbox">
          <input
            type="text"
            placeholder="subject/topic/user...."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="signButtons">
          <button onClick={logout}>Sign Out</button>
        </div>
        <div className="profile">
          <button className="bell" aria-label="Notifications">
            <FaBell />
            {unread > 0 && <span className="dot"></span>}
          </button>
          <button className="profileBtn" aria-label="Profile">
            <FaUserCircle />
            <span>{user.displayName || "Profile"}</span>
          </button>
        </div>
      </div>

      {/* left sidebar */}
      <div className="leftSidebar">
        <div className="Section1">
          <ul>
            <li onClick={() => setShowMyNotes(true)}>My Notes</li>
            <li onClick={() => setShowAdd(true)}>Add Notes</li>
            <li>Saved</li>
            <li>Favourites</li>
            <li>Recent</li>
          </ul>
        </div>

        <div className="Section2">
          <div className="dropdown">
            <button
              className="dropdownBtn"
              onClick={() => setCatOpen(!catOpen)}
              aria-expanded={catOpen}
            >
              Category{" "}
              <span className={catOpen ? "arrow open" : "arrow"}>
                <FaChevronDown />
              </span>
            </button>

            {catOpen && (
              <ul className="dropdownList">
                {categories.map(([name, count]) => (
                  <li
                    key={name}
                    className={activeCat === name ? "active" : ""}
                    onClick={() => setActiveCat(name)}
                  >
                    <span>{name}</span>
                    <span className="count">{count}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* middle */}
      <div className="Middlevbar">
        <div className="banner">
          <img src={BannerImg} alt="NoteShare banner" />
        </div>

        <div className="NotesBAr">
          <div className="grid">
            {loading && <p className="noResults">Loading notes...</p>}
            {!loading && loadError && <p className="noResults">{loadError}</p>}
            {!loading && !loadError && filteredNotes.length === 0 && (
              <p className="noResults">No notes found for "{search}"</p>
            )}

            {filteredNotes.map((n) => (
              <div className="card" key={n.id} onClick={() => setSelected(n)}>
                <div className="part1">
                  <div className="userRow">
                    <span className="userProfile">{(n.ownerName || "S")[0]}</span>
                    <p className="username">{n.ownerName || "Student"}</p>
                  </div>
                  <h3 className="topic">{n.topic}</h3>
                  <p className="info">{n.info}</p>
                  <div className="tags">
                    {n.tags.map((t) => (
                      <span className="tag" key={t}>{t}</span>
                    ))}
                  </div>
                  <span className="showNotes">Show notes →</span>
                </div>

                <div className="part2" onClick={(e) => e.stopPropagation()}>
                  <button className="action rating" aria-label="Review"><FaStar /> {n.review}</button>
                  <button className="action" aria-label="Saved"><FaRegBookmark /> {n.saved}</button>
                  <button className="action" aria-label="Favourite"><FaRegHeart /> {n.fav}</button>
                  <button className="action" aria-label="Comments"><FaRegComment /> {n.comment}</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* right sidebar */}
      <div className="RightSidebar">
        <div className="chatSystem">
          <div className="nav">Ask Questions</div>
          <div className="chatScreen"></div>
          <div className="foot">
            <input type="text" placeholder="type....." />
            <button aria-label="Send">
              <FaPaperPlane />
            </button>
          </div>
        </div>
      </div>

      <footer className="footer_section">
        <div className="footer-brand">
          <h2>Notes<span>Bhejde</span></h2>
          <p>Learn • Share • Grow</p>
        </div>

        <div className="footer-links">
          <a href="/">Home</a>
          <a href="/notes">My Notes</a>
          <a href="/groups">Study Groups</a>
          <a href="/help">Help</a>
          <a href="/contact">Contact</a>
        </div>

        <div className="footer-bottom">
          <p>© 2026 NoteShare</p>
          <div>
            <a href="#">Instagram</a>
            <a href="#">LinkedIn</a>
            <a href="#">GitHub</a>
          </div>
        </div>
      </footer>

      {/* popups */}
      {showAdd && (
        <AddNotes onClose={() => setShowAdd(false)} onAdd={addNote} />
      )}

      {showMyNotes && (
        <MyNotes
          notes={myNotes}
          onDelete={handleDelete}
          onView={handleViewFromMyNotes}
          onClose={() => setShowMyNotes(false)}
        />
      )}

      {selected && (
        <NoteView note={selected} onClose={() => setSelected(null)} />
      )}

    </div>
  );
}

export default Dashboard;
