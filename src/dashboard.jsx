import { useState, useEffect, useRef } from "react";
import "./dash.css";
import { useNavigate, Link } from "react-router-dom";
import AddNotes from "./components/addnotes";
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

function Dashboard({ notes, onAdd }) {
  const navigate = useNavigate();
  const [catOpen, setCatOpen] = useState(false);
  const [activeCat, setActiveCat] = useState("All Notes");
  const [unread] = useState(3);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const query = search.trim().toLowerCase();

  // ---- chat ----
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const chatEndRef = useRef(null);

  // scroll to the newest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault(); // stops the page from reloading
    const msg = text.trim();
    if (!msg) return; // ignore empty messages

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: msg,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setText("");
  };

  const filteredNotes = notes.filter((n) =>
    [n.topic, n.name, n.info, ...n.tags].join(" ").toLowerCase().includes(query)
  );

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
          <button>SignUp/SignIn</button>
        </div>
        <div className="profile">
          <button className="bell" aria-label="Notifications">
            <FaBell />
            {unread > 0 && <span className="dot"></span>}
          </button>
          <button
  className="profileBtn"
  aria-label="Profile"
  onClick={() => navigate("/profile")}
>
  <FaUserCircle />
</button>
        </div>
      </div>

      {/* left sidebar */}
      <div className="leftSidebar">
        <div className="Section1">
          <ul>
            <li onClick={() => navigate("/my-notes")}>My Notes</li>
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
            {filteredNotes.length === 0 && (
              <p className="noResults">No notes found for "{search}"</p>
            )}

            {filteredNotes.map((n) => (
              <div className="card" key={n.id} onClick={() => navigate(`/notes/${n.id}`)}>
                <div className="part1">
                  <div className="userRow">
                    <span className="userProfile">{n.name[0]}</span>
                    <p className="username">{n.name}</p>
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

          <div className="chatScreen">
            {messages.length === 0 && (
              <p className="chatEmpty">No messages yet. Ask your first question!</p>
            )}

            {messages.map((m) => (
              <div className="msg me" key={m.id}>
                <p>{m.text}</p>
                <span>{m.time}</span>
              </div>
            ))}

            <div ref={chatEndRef} />
          </div>

          <form className="foot" onSubmit={sendMessage}>
            <input
              type="text"
              placeholder="type....."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button type="submit" aria-label="Send">
              <FaPaperPlane />
            </button>
          </form>
        </div>
      </div>

      <footer className="footer_section">
        <div className="footer-brand">
          <h2>Notes<span>Bhejde</span></h2>
          <p>Learn • Share • Grow</p>
        </div>

        <div className="footer-links">
          <Link to="/">Home</Link>
          <Link to="/my-notes">My Notes</Link>
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
        <AddNotes
          onClose={() => setShowAdd(false)}
          onAdd={(note) => {
            onAdd(note);
            setShowAdd(false);
          }}
        />
      )}

    </div>
  );
}

export default Dashboard;