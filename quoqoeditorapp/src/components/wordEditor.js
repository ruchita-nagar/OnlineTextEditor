import './wordEditor.css'
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import React, { useEffect, useState, useRef } from 'react';
import { EditorState, ContentState, convertFromHTML, convertToRaw } from 'draft-js';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

function WordEditor() {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [toolbarDisplay, setToolbarDisplay] = useState("None");
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
  const [htmlContent, setHtmlContent] = useState();
  const [selectedText, setSelectedText] = useState(""); // Store the selected text
  const quillRef = useRef(null); // Ref for the Quill editor

  const [mouseX, setMouseX] = useState(null);
  const [mouseY, setMouseY] = useState(null);

  const handleMouseMove = (e) => {
    // Update the state with the current mouse coordinates
    if (e && e.clientX && e.clientY) {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    }
  };

  const parseDocxToHtml = async (file) => {
    var form = new FormData();
    form.append("file", file, "sample_file.docx");
    try {
      const response = await axios.post('http://127.0.0.1:8000/parse-docx-to-html', form);
      setHtmlContent(response.data.html_content);
    } catch (error) {
      console.error('Error in uploading DOCX file:', error);
    }
  }
  useEffect(() => {
    if (htmlContent) {
      const blocksFromHTML = convertFromHTML(htmlContent);
      const contentState = ContentState.createFromBlockArray(
        blocksFromHTML.contentBlocks,
        blocksFromHTML.entityMap
      );
      setEditorState(EditorState.createWithContent(contentState));
    }
  }, [htmlContent]);

  const handleFileUpload = () => {
    document.getElementById("UploadFile").click();
  };

  const downloadFile = async () => {
    const content = convertToRaw(editorState.getCurrentContent());
    try {
      const response = await axios.post('http://127.0.0.1:8000/parse-to-docx', {
        content: content
      }
        , {
          responseType: 'blob',
        });

      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'EditedWordFile.docx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error in downloading DOCX file', error);
    }
  }

  const downloadPdfFile = async () => {
    try {
      const response = await axios.post('http://127.0.0.1:8000/parse-to-pdf', {
        content: htmlContent
      }
        , {
          responseType: 'blob',
        });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'EditedPdfFile.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error in downloading PDF file', error);
    }
  }

  const handleFileChange = event => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      parseDocxToHtml(selectedFile);
    }
  };

  const modules = {
    toolbar: {
      container: [
        [{ 'font': [] }],
        [{ 'size': [] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        ['link', 'image'],
      ],
    },
  };

  useEffect(() => {
    if (selectedText.length > 0) {

    }
  },
    [selectedText])

  useEffect(() => {
    setPosition({
      top: mouseY + 5,
      left: mouseX
    });
  // eslint-disable-next-line
  }, [toolbarDisplay])

  useEffect(() => {
    const quill = quillRef.current.getEditor();
    quill.on("selection-change", (range, oldRange, source) => {
      if (range) {
        const startIndex = range.index;
        const endIndex = startIndex + range.length;
        const selectedText = quill.getText(startIndex, endIndex);
        if (endIndex - startIndex > 0) {
          setTimeout(() => {
            setToolbarDisplay("block");
          }, 100)
        }
        else
          setToolbarDisplay("none");
        setSelectedText(selectedText);
      } else {
        setSelectedText("");
        setToolbarDisplay("none");
      }
    });
  }, []);

  // Function to handle the mini toolbar actions
  const handleMiniToolbarAction = (action) => {
    const quill = quillRef.current.getEditor();
    switch (action) {
      case "bold":
        quill.format('bold', !quill.getFormat().bold);
        break;
      case "italic":
        quill.format('italic', !quill.getFormat().italic);
        break;
      case "underline":
        quill.format('underline', !quill.getFormat().underline);
        break;
      // Add more formatting options as needed
      default:
        break;
    }
  };

  return (
    <div className="bglight"
      onMouseMove={handleMouseMove}>
      <div
        className="toolbar-dialog"
        style={{
          position: 'absolute',
          zIndex: 100,
          display: `${toolbarDisplay}`,
          top: `${position.top}px`,
          left: `${position.left}px`,
        }}
      >
        <div className="mini-toolbar">
          {selectedText && (
            <>
              <button onClick={() => handleMiniToolbarAction("bold")}>
                B
              </button>
              <button onClick={() => handleMiniToolbarAction("italic")}>
                <i>I</i>
              </button>
              <button onClick={() => handleMiniToolbarAction("underline")}>
                <u>U</u>
              </button>
              {/* Add more formatting options as buttons */}
            </>
          )}
        </div>
      </div>

      <div className="row p-3">
        <nav className="navbar">
          <div className="container-fluid">
            <a className="navbar-brand" href="https://www.quoqo.com/" target='_blank' rel='noreferrer'>
              <img src="./images/quoqo_Logo.png" width="120" alt='logo'></img>
            </a>
          </div>
        </nav>
      </div>

      <div className="row mb-0">
        <div className="col-2" style={{ marginTop: '18%', marginLeft: '1%', }}>
          <input type="file" id='UploadFile' onChange={handleFileChange} hidden />
          <button className="btn btn-secondary buttonStyle" onClick={handleFileUpload}>Upload Docx File</button>
        </div>

        <div className="col-8 editor-container">
          <ReactQuill
            ref={quillRef}
            value={htmlContent}
            readOnly={false}
            onChange={setHtmlContent}
            theme="snow"
            modules={modules}
            style={{ height: '450px' }}
          />
        </div>

        <div className="col-2" style={{ marginTop: '15%' }}>
          <button className="btn btn-secondary buttonStyle" onClick={downloadFile}>Download as Docx File</button>
          <button className="btn btn-secondary buttonStyle" onClick={downloadPdfFile}>Download as Pdf File</button>
        </div>
      </div>

    </div>

  );
}

export default WordEditor;
