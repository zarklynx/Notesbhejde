import { useState } from "react";
import "./dash.css";
import AddNotes from "./components/addnotes";
import MyNotes from "./components/Mynotes";
import {
  FaBell, FaUserCircle, FaChevronDown, FaPaperPlane,
  FaStar, FaRegBookmark, FaRegHeart, FaRegComment,
} from "react-icons/fa";
import BannerImg from "./assets/bannerNoteApp.png";

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

const notes = [
  { name: "Rohit Sharma", topic: "AWS Cloud Practitioner", info: "A quick summary of core AWS services, IAM, EC2 and S3 for beginners.", tags: ["AWS", "Cloud", "DevOps"], review: 4.8, saved: 42, fav: 58, comment: 7 },
  { name: "Sneha Patil", topic: "Git Basics for Beginners", info: "Simple explanation of Git commands with real world examples.", tags: ["Git", "Version Control"], review: 4.6, saved: 35, fav: 58, comment: 12 },
  { name: "Aditya Kulkarni", topic: "MERN Expense Tracker", info: "Expense tracker built with the MERN stack and deployed on AWS.", tags: ["MERN", "AWS", "Project"], review: 4.9, saved: 95, fav: 76, comment: 23 },
  { name: "Pooja Singh", topic: "Linux Commands Cheat Sheet", info: "Useful Linux commands with examples for quick revision.", tags: ["Linux", "Cheat Sheet"], review: 4.7, saved: 76, fav: 64, comment: 18 },
];


function Dashboard() {
  const [catOpen, setCatOpen] = useState(false);
  const [activeCat, setActiveCat] = useState("All Notes");
  const [unread] = useState(3);
  const [search, setSearch] = useState("");
  const query = search.trim().toLowerCase();
  const [showAdd, setShowAdd] = useState(false);
  const [showMyNotes, setShowMyNotes] = useState(false);

  const filteredNotes = notes.filter((n) =>
    [n.topic, n.name, n.info, ...n.tags].join(" ").toLowerCase().includes(query));

  return (
    <div className="dash">
      {/* navbar */}
      <div className="navbar">
        <div className="symbol">NotesBhejde</div>
        <div className="searchbox">
          <input type="text" placeholder="subject/topic/user...." 
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
          <button className="profileBtn" aria-label="Profile">
            <FaUserCircle />
            <span>Profile</span>
          </button>
        </div>
      </div>

      {/* left sidebar */}
      <div className="leftSidebar">
        <div className="Section1">
          <ul>
            <li onClick={() => setShowMyNotes(true)}>My Notes</li>            <li onClick={() => setShowAdd(true)}>Add Notes</li>
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
    <div className="card" key={n.topic}>
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
      </div>

      <div className="part2">
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
      {showAdd && (
  <AddNotes onClose={() => setShowAdd(false)} />
)}

{showMyNotes && (
  <MyNotes onClose={() => setShowMyNotes(false)} />
)}   
    </div>
  );
}

export default Dashboard;
