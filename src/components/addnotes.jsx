import React, { useState } from "react";
import "./AddNotesCss.css"

function AddNotes({onClose}) {
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    description: "",
    tags: "",
    file: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      file: e.target.files[0],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();

    data.append("title", formData.title);
    data.append("subject", formData.subject);
    data.append("description", formData.description);
    data.append("tags", formData.tags);

    if (formData.file) {
      data.append("file", formData.file);
    }

    console.log("Data ready for backend:", formData);

    // Later:
    // await fetch("http://localhost:5000/api/notes", {
    //   method: "POST",
    //   body: data,
    //   credentials: "include"
    // });
  };

  return (
    <>
      <div className="main">

        <div className="add-note-header">
          <div>
            <h2>Add Note</h2>
            <p>Share your notes with other students</p>
          </div>

          <button
            type="button"
            className="close-btn"
             onClick={onClose}
          >
            ✕
          </button>
        </div>


        <form onSubmit={handleSubmit}>

          {/* Note Title */}
          <div className="form-group">
            <label>Note Title</label>

            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter note title..."
              required
            />
          </div>


          {/* Subject */}
          <div className="form-group">
            <label>Subject</label>

            <select
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
            >
              <option value="">Select subject</option>

              <option value="Computer Science">
                Computer Science
              </option>

              <option value="MCA">
                MCA
              </option>

              <option value="BCA">
                BCA
              </option>

              <option value="Cloud Computing">
                Cloud Computing
              </option>

              <option value="DevOps / Linux">
                DevOps / Linux
              </option>
            </select>
          </div>


          {/* Description */}
          <div className="form-group">
            <label>Description</label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Tell students about your notes..."
              rows="4"
            ></textarea>
          </div>


          {/* Upload */}
          <div className="form-group">
            <label>Upload Note</label>

            <div className="upload-box">

              <div className="upload-icon">
                📄
              </div>

              <p>
                {formData.file
                  ? formData.file.name
                  : "Upload your notes"}
              </p>

              <span>
                PDF, DOCX or PPTX
              </span>

              <input
                type="file"
                id="noteFile"
                name="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx"
                onChange={handleFileChange}
                hidden
              />

              <label
                htmlFor="noteFile"
                className="browse-btn"
              >
                Browse File
              </label>

            </div>
          </div>


          {/* Tags */}
          <div className="form-group">
            <label>Tags</label>

            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="#AWS #Cloud #DevOps"
            />
          </div>


          {/* Buttons */}
          <div className="form-actions">

            <button
              type="reset"
              className="cancel-btn"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="add-btn"
            >
              + Add Note
            </button>

          </div>

        </form>

      </div>
    </>
  );
}

export default AddNotes;