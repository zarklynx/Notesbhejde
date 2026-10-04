import { lazy, Suspense, useEffect, useState } from "react";
import "./dash.css";
const AddNotes = lazy(() => import('./components/addnotes'));
const MyNotes = lazy(() => import('./components/Mynotes'));
const NoteView = lazy(() => import('./components/notesCard'));
const Leaderboard = lazy(() => import('./components/Leaderboard'));
import { getNotes, deleteNote } from "./api";
import { useAuth } from "./context/AuthContext";
import {
  FaBell, FaChevronDown,
  FaRegBookmark, FaRegHeart, FaRegComment, FaHeart,
  FaBookOpen, FaPlus, FaFolder, FaHistory, FaTrophy, FaLayerGroup,
} from "react-icons/fa";
import BannerImg from "./assets/BannerNoteApp.webp";
import { ChatRooms, ProfileDialog } from './components/Community';
import ProfileAvatar from './components/ProfileAvatar';
import LoadingState from './components/LoadingState';
import { watchItems, saveNote, unsaveNote, toggleFavourite, recordRecent, createFolder, deleteFolder, indexNotes, watchStats, removeNoteActivity } from './services/community';

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
  const [view, setView] = useState('All');
  const [saved, setSaved] = useState([]), [favourites, setFavourites] = useState([]), [recent, setRecent] = useState([]), [folders, setFolders] = useState([]);
  const [folderFilter, setFolderFilter] = useState(''), [saveTarget, setSaveTarget] = useState(null), [folderName, setFolderName] = useState('');
  const [profile, setProfile] = useState(null), [notifications, setNotifications] = useState(false), [activity, setActivity] = useState([]), [seen, setSeen] = useState(() => Number(localStorage.getItem(`notification-seen:${user.uid}`) || 0));
  const [actionError, setActionError] = useState('');
  const [noteStats,setNoteStats] = useState([]);
  const [myProfile,setMyProfile] = useState(null);
  const [pendingLikes, setPendingLikes] = useState({});
  useEffect(()=>watchItems('publicProfiles',items=>setMyProfile(items[0] || null),undefined,false,user.uid),[user.uid]);
  useEffect(()=>watchStats(setNoteStats,e=>setActionError(e.message)),[]);
  const unread = activity.filter(a => (a.createdAt?.toMillis?.() || 0) > seen && a.authorId !== user.uid).length;
  useEffect(() => {
    const failed = e => setActionError(e.message);
    const base = `users/${user.uid}`;
    const stops = [watchItems(`${base}/savedNotes`, setSaved, failed), watchItems(`${base}/favourites`, setFavourites, failed), watchItems(`${base}/recentNotes`, setRecent, failed), watchItems(`${base}/folders`, setFolders, failed), watchItems(`${base}/notifications`, setActivity, failed, true)];
    return () => stops.forEach(stop => stop());
  }, [user.uid]);
  function openNote(note) { setSelected(note); recordRecent(note.id).catch(e => setActionError(e.message)); }
  const savedIds = new Set(saved.filter(s => !folderFilter || (s.folderId || 'default') === folderFilter).map(s => s.noteId));
  const favIds = new Set(favourites.map(s => s.noteId));
  const recentIds = new Set(recent.map(s => s.noteId));
  async function likeNote(noteId) {
    if (pendingLikes[noteId]) return;
    const wasLiked = favIds.has(noteId);
    setPendingLikes(previous => ({ ...previous, [noteId]: true }));
    setFavourites(previous => wasLiked ? previous.filter(item => item.noteId !== noteId) : [...previous, { id: noteId, noteId }]);
    try { await toggleFavourite(noteId, wasLiked); setActionError(''); }
    catch (error) {
      setFavourites(previous => wasLiked ? [...previous.filter(item => item.noteId !== noteId), { id: noteId, noteId }] : previous.filter(item => item.noteId !== noteId));
      setActionError(error.message);
    } finally { setPendingLikes(previous => ({ ...previous, [noteId]: false })); }
  }
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
        if (active) { setNotes(nextNotes); indexNotes(nextNotes).catch(e=>setActionError(e.message)); }
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

  const filteredNotes = notes.filter(n => (activeCat === 'All Notes' || n.subject === activeCat) && (view !== 'Saved' || savedIds.has(n.id)) && (view !== 'Favourites' || favIds.has(n.id)) && (view !== 'Recent' || recentIds.has(n.id))).filter((n) =>
    [n.topic, n.ownerName, n.info, ...(n.tags || [])].join(" ").toLowerCase().includes(query)
  );
  if (view === 'Recent') filteredNotes.sort((a,b) => (recent.find(r => r.noteId === b.id)?.createdAt?.toMillis?.() || 0) - (recent.find(r => r.noteId === a.id)?.createdAt?.toMillis?.() || 0));

  // only the notes owned by the logged in user
  const myNotes = notes.filter((n) => n.ownerId === user.uid);

  const addNote = (note) => {
    setNotes((prev) => [note, ...prev]); // new note goes first
    setShowAdd(false);
    indexNotes([note]).catch(e=>setActionError(e.message));
  };

  const handleDelete = async (note) => {
    await deleteNote(note);
    setNotes((prev) => prev.filter((n) => n.id !== note.id));
    removeNoteActivity(note.id).catch(e=>setActionError(e.message));
  };

  const handleViewFromMyNotes = (note) => {
    setShowMyNotes(false);
    openNote(note);
  };

  function goHome() {
    setView('All'); setActiveCat('All Notes'); setSearch(''); setFolderFilter('');
    setProfile(null); setSelected(null); setShowAdd(false); setShowMyNotes(false);
    setSaveTarget(null); setNotifications(false); setCatOpen(false); setActionError('');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  if(profile) return <ProfileDialog key={profile.uid} {...profile} notes={notes} onClose={()=>setProfile(null)} onHome={goHome} onOpen={openNote} />;
  return (
    <div className="dash">
      {/* navbar */}
      <div className="navbar">
        <button type="button" className="symbol" aria-label="Notes bhejde home" onClick={goHome}><span>Notes</span><small>bhejde</small></button>
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
          <button className="bell" aria-label="Notifications" onClick={() => { const now = Date.now(); setNotifications(true); setSeen(now); localStorage.setItem(`notification-seen:${user.uid}`,String(now)); }}>
            <FaBell />
            {unread > 0 && <span className="dot"></span>}
          </button>
          <button className="profileBtn" aria-label="Profile" onClick={() => setProfile({uid:user.uid,name:user.displayName})}>
            <ProfileAvatar userId={user.uid} variant={myProfile?.avatarVariant} photoURL={myProfile?.photoURL} size={30} label="Your profile" />
            <span>{user.displayName || "Profile"}</span>
          </button>
        </div>
      </div>

      {/* left sidebar */}
      <div className="leftSidebar">
        <div className="Section1">
          <ul>
            <li><button className="sidebar-link" onClick={() => setShowMyNotes(true)}><FaBookOpen aria-hidden="true" /><span>My Notes</span></button></li>
            <li><button className="sidebar-link sidebar-create" onClick={() => setShowAdd(true)}><FaPlus aria-hidden="true" /><span>Add Notes</span></button></li>
            {[['Saved',FaFolder],['Favourites',FaRegHeart],['Recent',FaHistory],['Leaderboard',FaTrophy]].map(([name,Icon]) => <li key={name}><button className={`sidebar-link${view === name ? ' is-active' : ''}`} aria-current={view === name ? 'page' : undefined} onClick={() => { setView(name); setFolderFilter(''); setActiveCat('All Notes'); }}><Icon aria-hidden="true" /><span>{name}</span></button></li>)}
          </ul>
        </div>

        <div className="Section2">
          <div className="dropdown">
            <button
              className="dropdownBtn"
              onClick={() => setCatOpen(!catOpen)}
              aria-expanded={catOpen}
            >
              <span className="category-label"><FaLayerGroup aria-hidden="true" />Categories</span>
              <span className={catOpen ? "arrow open" : "arrow"}>
                <FaChevronDown />
              </span>
            </button>

            {catOpen && (
              <ul className="dropdownList">
                {categories.map(([name]) => (
                  <li key={name}>
                    <button className={view === 'All' && activeCat === name ? "category-option active" : "category-option"} aria-pressed={view === 'All' && activeCat === name} onClick={() => { setActiveCat(name); setView('All'); }}>
                    <span>{name}</span>
                    <span className="count">{notes.filter(n => name === 'All Notes' || n.subject === name).length}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* middle */}
      <div className="Middlevbar">
        {view !== 'Saved' && view !== 'Leaderboard' && <div className="banner">
          <img src={BannerImg} alt="NotesBhejde banner" width="1200" height="400" decoding="async" fetchPriority="high" />
        </div>}

        {view === 'Leaderboard' ? <Suspense fallback={<LoadingState label="Getting the standings" skeleton />}><Leaderboard notes={notes} onProfile={(uid,name)=>setProfile({uid,name})} /></Suspense> : <div className="NotesBAr">
          <div className="library-controls"><strong>{view === 'All' ? activeCat : view === 'Saved' && folderFilter ? `Saved / ${folderFilter === 'default' ? 'General' : folders.find(f => f.id === folderFilter)?.name || 'Folder'}` : view}</strong>{view === 'Saved' && folderFilter && <button onClick={() => setFolderFilter('')}>← All folders</button>}</div>
          {view === 'Saved' && !folderFilter && <section className="saved-library"><p>Organise your saved notes into folders. Deleting a folder moves its notes to General.</p><form onSubmit={async e => { e.preventDefault(); try { await createFolder(folderName); setFolderName(''); } catch(e) { setActionError(e.message); } }}><input aria-label="New folder name" placeholder="Folder name" maxLength={60} value={folderName} onChange={e => setFolderName(e.target.value)} /><button disabled={!folderName.trim()}>Create folder</button></form><div className="saved-folder-grid">{[{id:'default',name:'General'},...folders].map(f => <article key={f.id}><button className="folder-open" onClick={() => setFolderFilter(f.id)}>📁 <strong>{f.name}</strong><span>{saved.filter(s => s.folderId === f.id || (f.id === 'default' && !s.folderId)).length} notes</span></button>{f.id !== 'default' && <button className="folder-delete" aria-label={`Delete ${f.name} folder`} onClick={async () => { if (!window.confirm(`Delete “${f.name}”? Saved notes will move to General.`)) return; try { await deleteFolder(f.id); } catch(e) { setActionError(e.message); } }}>Delete folder</button>}</article>)}</div></section>}
          {actionError && <p role="alert">{actionError}</p>}
          {(view !== 'Saved' || folderFilter) && <div className="grid">
            {loading && <LoadingState label="Gathering your notes" skeleton />}
            {!loading && loadError && <p className="noResults">{loadError}</p>}
            {!loading && !loadError && filteredNotes.length === 0 && (
              <p className="noResults">No notes found for "{search}"</p>
            )}

            {filteredNotes.map((n) => (
              <div className="card" key={n.id} onClick={() => openNote(n)}>
                <div className="part1">
                  <div className="userRow">
                    <span className="userProfile">{(n.ownerName || "S")[0]}</span>
                    <button className="username" onClick={e => { e.stopPropagation(); setProfile({uid:n.ownerId,name:n.ownerName}); }}>{n.ownerName || "Student"}</button>
                  </div>
                  <h3 className="topic">{n.topic}</h3>
                  <p className="info">{n.info}</p>
                  <div className="tags">
                    {(n.tags || []).map((t) => (
                      <span className="tag" key={t}>{t}</span>
                    ))}
                  </div>
                  <span className="showNotes">Show notes →</span>
                </div>

                <div className="part2" onClick={(e) => e.stopPropagation()}>
                  <span className="action rating" aria-label="Views">{noteStats.find(s=>s.id===n.id)?.views || 0} views</span>
                  <button className="action" aria-label="Save to folder" aria-pressed={saved.some(s => s.noteId === n.id)} onClick={() => setSaveTarget(n)}><FaRegBookmark /> {saved.some(s => s.noteId === n.id) ? 'Saved' : 'Save'}</button>
                  <button className="action favourite-action" aria-label="Favourite" aria-pressed={favIds.has(n.id)} disabled={pendingLikes[n.id]} onClick={() => likeNote(n.id)}>{favIds.has(n.id) ? <FaHeart key="liked" className="liked-icon" /> : <FaRegHeart key="unliked" />} {noteStats.find(s=>s.id===n.id)?.favourites || 0} {favIds.has(n.id) ? 'Liked' : 'Like'}</button>
                  <button className="action" aria-label="Comments" onClick={() => openNote(n)}><FaRegComment /> Comments</button>
                </div>
              </div>
            ))}
          </div>}
        </div>}
      </div>

      {/* right sidebar */}
      <div className="RightSidebar">
        <div className="chatSystem">
          <ChatRooms onProfile={(uid,name) => setProfile({uid,name})} />
        </div>
      </div>

      <footer className="footer_section">
        <div className="footer-brand">
          <h2>Notes<span>bhejde</span></h2>
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
      <Suspense fallback={<div className="community-overlay"><LoadingState label="Opening your notes" skeleton /></div>}>
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
        <NoteView note={selected} onClose={() => setSelected(null)} onProfile={(uid,name) => setProfile({uid,name})} onSave={() => setSaveTarget(selected)} onFavourite={() => likeNote(selected.id)} saved={saved.some(s => s.noteId === selected.id)} favourite={favIds.has(selected.id)} />
      )}
      {saveTarget && <div className="community-overlay" onClick={() => setSaveTarget(null)}><section className="community-dialog" role="dialog" aria-modal="true" aria-label="Save note to folder" onClick={e => e.stopPropagation()}><h2>Save to folder</h2>{[{id:'default',name:'General'},...folders].map(f => <button key={f.id} onClick={async () => { try { await saveNote(saveTarget.id,f.id); setSaveTarget(null); } catch(e) { setActionError(e.message); } }}>{f.name}</button>)}<form onSubmit={async e => { e.preventDefault(); try { const folder = await createFolder(folderName); await saveNote(saveTarget.id,folder.id); setFolderName(''); setSaveTarget(null); } catch(e) { setActionError(e.message); } }}><label>New folder<input value={folderName} maxLength={60} onChange={e => setFolderName(e.target.value)} /></label><button disabled={!folderName.trim()}>Create and save</button></form>{saved.some(s => s.noteId === saveTarget.id) && <button onClick={async () => { try { await unsaveNote(saveTarget.id); setSaveTarget(null); } catch(e) { setActionError(e.message); } }}>Unsave</button>}<button onClick={() => setSaveTarget(null)}>Cancel</button></section></div>}
      {notifications && <div className="community-overlay" onClick={() => setNotifications(false)}><section className="community-dialog" role="dialog" aria-label="Notifications" onClick={e => e.stopPropagation()}><button onClick={() => setNotifications(false)}>Close</button><h2>Notifications</h2>{activity.filter(a => a.authorId !== user.uid).map(a => <article key={a.id}><p><button onClick={()=>{setNotifications(false);setProfile({uid:a.authorId,name:a.authorName})}}>{a.authorName}</button> {a.text}</p>{notes.some(n=>n.id===a.noteId) && <button onClick={()=>{setNotifications(false);openNote(notes.find(n=>n.id===a.noteId))}}>Open note</button>}</article>)}{!activity.some(a => a.authorId !== user.uid) && <p>No notifications yet. Favourites and comments on your notes will appear here.</p>}</section></div>}

      </Suspense>
    </div>
  );
}

export default Dashboard;
