import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { createNote, validateNote } from "../api";
import "./AddNotesCss.css";

function AddNotes({ onClose, onAdd }) {
  const fileRef = useRef(null);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [validation, setValidation] = useState(null);

  // close with the Esc key
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const actualContent = async () => {
    if (content.trim()) return content.trim();
    if (file?.type === "application/pdf") {
      const url = URL.createObjectURL(file);
      try {
        const { readPdfText } = await import("./masterji/pdfText");
        return await readPdfText(url);
      } finally {
        URL.revokeObjectURL(url);
      }
    }
    throw new Error("Paste the note content below or upload a PDF so its text can be read.");
  };

  const handleSubmit = async () => {
    if (!title.trim() || !subject || !description.trim()) {
      setError("Please enter a title, description, and subject.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      if (!validation) {
        const extractedContent = await actualContent();
        const result = await validateNote({ title: title.trim(), description: description.trim(), content: extractedContent });
        setValidation({ ...result, content: extractedContent });
        return;
      }
      const note = await createNote({
        title: title.trim(),
        subject,
        description: description.trim(),
        content: validation.content,
        tags: tags.split(/[\s,#]+/).filter(Boolean),
        file,
      });
      onAdd(note);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="an-overlay" onClick={onClose}>
      <div className="an-panel" onClick={(e) => e.stopPropagation()}>

        <div className="an-header">
          <div>
            <h2>Add Note</h2>
            <p>Share your notes with other students</p>
          </div>
          <button className="an-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="an-body">
          <div className="an-group">
            <label>Note Title</label>
            <input
              type="text"
              placeholder="Enter note title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="an-group">
            <label>Subject</label>
            <select value={subject} onChange={(e) => setSubject(e.target.value)}>
              <option value="">Select subject</option>
              <option>Computer Science</option>
              <option>MCA</option>
              <option>BCA</option>
              <option>Cloud Computing</option>
              <option>DevOps / Linux</option>
              <option>Projects</option>
              <option>Study Material</option>
              <option>Other</option>
            </select>
          </div>

          <div className="an-group">
            <label>Description</label>
            <textarea
              placeholder="Tell students about your notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>

          <div className="an-group">
            <label>Note Content</label>
            <textarea
              className="an-content"
              placeholder="Paste the note text here, or choose a PDF and it will be extracted automatically..."
              value={content}
              onChange={(e) => { setContent(e.target.value); setValidation(null); }}
            ></textarea>
          </div>

          <div className="an-group">
            <label>Upload Note</label>
            <div className="an-upload">
              <div className="an-upload-icon">📄</div>
              <p>{file ? file.name : "Upload your notes"}</p>
              <span>PDF, DOCX, PPTX or an image</span>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.docx,.pptx,image/*"
                hidden
                onChange={(e) => { setFile(e.target.files[0] || null); setValidation(null); }}
              />
              <button
                type="button"
                className="an-browse"
                onClick={() => fileRef.current.click()}
              >
                {file ? "Change File" : "Browse File"}
              </button>
            </div>
          </div>

          <div className="an-group">
            <label>Tags</label>
            <input
              type="text"
              placeholder="#AWS  #Cloud  #DevOps"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          {error && <p className="an-error">{error}</p>}

          {validation && (
            <div className={`an-validation an-validation-${validation.isMatch ? "strong" : validation.score >= 60 ? "partial" : "poor"}`}>
              <strong>
                {validation.isMatch ? "✅ Strong match" : validation.score >= 60 ? "⚠️ Partial match" : "❌ Poor match"}
              </strong>
              <span>Content Match: {validation.score}%</span>
              <p>{validation.reason}</p>
              {validation.matchedTopics.length > 0 && <p><b>Matched:</b> {validation.matchedTopics.join(", ")}</p>}
              {validation.missingTopics.length > 0 && <p><b>Missing:</b> {validation.missingTopics.join(", ")}</p>}
              {validation.extraTopics.length > 0 && <p><b>Extra:</b> {validation.extraTopics.join(", ")}</p>}
            </div>
          )}

          <div className="an-actions">
            <button type="button" className="an-cancel" onClick={onClose}>Cancel</button>
            <button type="button" className="an-add" onClick={handleSubmit} disabled={loading}>
              {loading ? (validation ? "Adding..." : "Checking...") : validation ? "Publish Note" : "Validate Content"}
            </button>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
}

export default AddNotes;