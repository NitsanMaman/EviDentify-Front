import React, { useState, useRef, useEffect } from 'react';
import imageCompression from 'browser-image-compression';
import './AdmissionForm.css';
import Swal from 'sweetalert2';
import { useLocation } from 'react-router-dom';
import LocationForm from './LocationForm';
import { useNavigate } from 'react-router-dom';


function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const AdmissionForm = React.memo(() => {
  const query = useQuery();
  const uid = query.get('uid'); 
  const role = query.get('role');
  let SubmitUpdate = "Submit";
  if (role === 'manager'){
    SubmitUpdate = "Update";
  }
  const [currentStation, setCurrentStation] = useState("current station"); // Initialize as required
  const [stations, setStations] = useState(["prev station", "current station", "next station"]);
  const navigate = useNavigate();


  const handleStationChange = (e) => {
    setCurrentStation(e.target.value);
  };

  const selectStation = (station) => {
    setCurrentStation(station);
  };

  const [formData, setFormData] = useState({
    fullName: '',
    witnesses: [],
    job: '',
    email: '',
    mobileNumber: '',
    dateOfIdentify: '',
    category: '',
    description: '',
    photo: null,
    location: { type: 'Point', coordinates: null, description: '' },
    uid: uid,
    prevStation: '',
    currentStation: '',
    nextStation: '',
    specialHandle: []
  });

  const [signatureData, setSignatureData] = useState('');
  const [isFormFilled, setIsFormFilled] = useState(false);
  const signaturePadRef = useRef(null);

  // State for managing witnesses
  const [witnesses, setWitnesses] = useState([]);
  const [newWitness, setNewWitness] = useState('');


  // Function to handle adding a new witness
  const addWitness = () => {
    if (newWitness.trim() !== '') {
      setWitnesses([...witnesses, newWitness]);
      setNewWitness(''); // Clear the input field after adding
    }
  };

  // Function to handle removing a witness
  const removeWitness = (index) => {
    const updatedWitnesses = [...witnesses];
    updatedWitnesses.splice(index, 1);
    setWitnesses(updatedWitnesses);
  };

  // JSX for rendering the witnesses list
  const renderWitnesses = () => {
    return witnesses.map((witness, index) => (
      <div key={index} className="witness-item">
        <span>{witness}</span>
        {!isFormFilled && (  // Only render the button if the form is not filled
          <button 
            type="button" 
            onClick={() => removeWitness(index)}
          >
            X
          </button>
        )}
      </div>
    ));
  };

  useEffect(() => {
    if (uid) {
      fetch(`http://localhost:5000/get-form-data/${uid}`)
        .then(res => res.json())
        .then(data => {
          if (data.fullName) {
            const {
              fullName, job, email, mobileNumber, dateOfIdentify, category, description, photo, signature, witnesses, location, prevStation, currentStation, nextStation, specialHandle
            } = data;
            
            var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds

            const formattedDate = dateOfIdentify ? (new Date(new Date(dateOfIdentify) - tzoffset)).toISOString().slice(0, -1) : '';
  
            setFormData({
              fullName, job, email, mobileNumber, dateOfIdentify: formattedDate, category, description, photo, uid, location, prevStation, currentStation, nextStation, specialHandle
            });
            setWitnesses(witnesses || []);
            setSignatureData(signature);
            setIsFormFilled(true);
          }
        })
        .catch(err => {
          console.error('Fetch error:', err);
          Swal.fire('Error', 'Failed to fetch form data.', 'error');
        });
    }
  }, [uid]);

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    setFormData(prev => {
      const updatedSpecialHandle = checked
        ? [...prev.specialHandle, name]
        : prev.specialHandle.filter(item => item !== name);
      return { ...prev, specialHandle: updatedSpecialHandle };
    });
  };
  
  

  const handleLocationSelect = (location) => {
    setFormData(prev => ({
      ...prev,
      location: { type: 'Point', coordinates: location, description: prev.location.description }
    }));
  };

  const handleLocationDescChange = (desc) => {
    setFormData(prev => ({
      ...prev,
      location: { ...prev.location, description: desc }
    }));
  };

  useEffect(() => {
    const canvas = signaturePadRef.current;
    if (!canvas) return; // Guard against initial render
  
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
  
    // Function to reset and draw the signature image
    const drawSignatureImage = () => {
      const image = new Image();
      image.src = signatureData;
      image.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      };
    };
  
    if (signatureData) {
      drawSignatureImage();
    }
  
    let isDrawing = false;
    let startX = 0;
    let startY = 0;
    let hasMoved = false;
  
    const startDrawing = e => {
      if (isFormFilled) return; // Prevent drawing if form is filled
      isDrawing = true;
      hasMoved = false;
      const { clientX, clientY } = e;
      const rect = canvas.getBoundingClientRect();
      startX = clientX - rect.left;
      startY = clientY - rect.top;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
    };
  
    const draw = e => {
      if (!isDrawing) return;
      hasMoved = true;
      const { clientX, clientY } = e;
      const rect = canvas.getBoundingClientRect();
      ctx.lineTo(clientX - rect.left, clientY - rect.top);
      ctx.stroke();
    };
  
    const stopDrawing = () => {
      if (!hasMoved) return;
      isDrawing = false;
      ctx.closePath();
      saveSignature(canvas.toDataURL()); // Save the drawn signature
    };
  
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);
  
    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseleave', stopDrawing);
    };
  }, [signatureData, isFormFilled]); // React to changes in signatureData or form fill status
  

  const clearSignature = () => {
    const canvas = signaturePadRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureData(null);
    // Remove error class
    canvas.classList.remove('NOerror');

    // Add NOerror class
    canvas.classList.add('error');
  };

  const saveSignature = () => {
    const canvas = signaturePadRef.current;
    setSignatureData(canvas.toDataURL('image/png'));
  };


  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value  }));
    // Remove error class when user interacts with the input
    const newErrors = { ...errors };
    delete newErrors[name];
    setErrors(newErrors);
  };
  
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    compressImage(file, 0.5, (compressedDataUrl) => {
      setFormData(prev => ({ ...prev, photo: compressedDataUrl }));
    });
  };
  
  function compressImage(file, quality, callback) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function(event) {
      const img = new Image();
      img.src = event.target.result;
      img.onload = function() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        callback(dataUrl);
      };
    };
  }
  
  
  const [errors, setErrors] = useState({});

  function validateForm() {
    const newErrors = {};
    if (!formData.fullName) newErrors.fullName = true;
    if (!formData.job) newErrors.job = true;
    if (!formData.email) newErrors.email = true;
    if (!formData.mobileNumber) newErrors.mobileNumber = true;
    if (!formData.dateOfIdentify) newErrors.dateOfIdentify = true;
    if (!formData.category) newErrors.category = true;
    if (!formData.description) newErrors.description = true;
    if (!signatureData) {
      newErrors.signature = true;
    }    
    setErrors(newErrors);

    // If any errors were added, form is not valid
    return Object.keys(newErrors).length === 0;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!uid) {
      Swal.fire('Error', 'No UID provided.', 'error');
      return;
    }
  
    setErrors({});
  
    if (!validateForm()) {
      Swal.fire({
        title: 'Error!',
        text: 'Please fill in all required fields.',
        icon: 'error',
        confirmButtonText: 'Ok'
      });
      return; // Stop form submission
    }
  
    // Compress the image before submission
    let compressedPhoto = formData.photo;
    if (compressedPhoto) {
      const response = await fetch(compressedPhoto);
      const blob = await response.blob();
      compressedPhoto = await imageCompression(blob, { maxSizeMB: 0.5, maxWidthOrHeight: 1024 });
      const reader = new FileReader();
      reader.readAsDataURL(compressedPhoto);
      await new Promise(resolve => reader.onload = resolve);
      compressedPhoto = reader.result;
    }
  
    const submissionData = { 
      ...formData, 
      photo: compressedPhoto, 
      witnesses, 
      signature: signatureData, 
      location: { ...formData.location, description: formData.location.description }
    };
  
    try {
      const response = await fetch('http://localhost:5000/submit-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData)
      });
      if (!response.ok) throw new Error('Network response was not ok.');
      
      const result = await response.json();
      if (role === 'manager') {
        Swal.fire('Updated', 'Form data Updated successfully!', 'success').then(() => { window.location.reload(); });
      } else {
        Swal.fire('Success', 'Form data submitted successfully!', 'success').then(() => { window.location.reload(); });
      }
    } catch (error) {
      console.error('Error:', error);
      Swal.fire('Error', 'Failed to submit form.', 'error');
    }
  };
  
  
  
  
  // Function to handle the form deletion
  const handleDelete = async (fromSubmit) => {
    if (!uid) {
      Swal.fire('Error', 'No UID provided.', 'error');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/delete-form/${uid}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete the form.');
      if (role === 'manager'){
        Swal.fire('Deleted', 'Form has been successfully deleted.', 'success').then(() => {
          if (fromSubmit) {
            
          } else {
            navigate('/manager-page/?uid=1'); // Navigate to another page
          }
        });
      }
    } catch (error) {
      console.error('Deletion error:', error);
      Swal.fire('Error', 'Failed to delete form.', 'error');
    }
  };

  // Function to enable editing
  const enableEditing = () => {
    setIsFormFilled(false);
  };

  return (
    <div className="admission-form">
      <h2 className="logo">EviDentify</h2><br></br><br></br>
      <form onSubmit={handleSubmit}>
      <label>
          Category:
          <select name="category" value={formData.category} onChange={handleInputChange} className={errors.category ? 'error' : 'NOerror'} disabled={isFormFilled}>
            <option value="">Select</option>
            <option value="General">General</option>
            <option value="MCI">MCI</option>
            <option value="Crime">Crime</option>
            <option value="Identify">Identify</option>
            <option value="Labeling">Labeling</option>
          </select>
        </label>
        <div className="progress-header">
          <div >Prev Station</div>
          <div >Current Station</div>
          {!isFormFilled && (<div >Next Station</div>)}
        </div>
        <div className="progress-bar">
          <div className={`progress-step ${formData.prevStation ? 'completed' : ''}`} value={formData.prevStation}>{formData.nextStation && isFormFilled ? 'Filling Form' : formData.currentStation}</div>
          <div className="progress-step current" value={formData.currentStation}>{formData.nextStation && isFormFilled ? formData.nextStation : 'Filling Form'}</div>
          {!isFormFilled && (<div className="progress-step">
            <select name="nextStation" value={formData.nextStation} onChange={handleInputChange} className="station-select" disabled={isFormFilled}>
              <option value="">Select Next Station</option>
              <option value="Lab Examin">Lab Examin</option>
              <option value="Storage">Storage</option>
              <option value="Manager Lookup">Manager Lookup</option>
              <option value="Other">Other</option>
            </select>
          </div>)}
        </div>
        <div className="witness-section">
          <label>
            Witnesses:
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="text"
                value={newWitness}
                onChange={(e) => setNewWitness(e.target.value)}
                placeholder="Enter witness name"
                hidden={isFormFilled}
                style={{ flex: 1, border: "1px solid #ccc"}}
              />
              <button
                type="button"
                onClick={addWitness}
                hidden={isFormFilled}
                style={{
                  width: '30px',
                  height: '30px',
                  lineHeight: '30px',
                  textAlign: 'center',
                  padding: '0',
                  fontSize: '20px',
                  backgroundColor: '#007BFF',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  position: 'relative',
                  top: '-5px', 
                  left:'5px'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#007BFF'}
              >
                +
              </button>
            </div>
          </label>
          <div className="witness-list">
            {renderWitnesses()}
          </div>
        </div>
        <label>
          Full Name:
          <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className={errors.fullName ? 'error' : 'NOerror'} disabled={isFormFilled} />
        </label>
        <label>
          Job:
          <input type="text" name="job" value={formData.job} onChange={handleInputChange} className={errors.job ? 'error' : 'NOerror'} disabled={isFormFilled} />
        </label>
        <label>
          Email:
          <input type="email" name="email" value={formData.email} onChange={handleInputChange} className={errors.email ? 'error' : 'NOerror'} disabled={isFormFilled} />
        </label>
        <label>
          Mobile No:
          <input type="number" name="mobileNumber" value={formData.mobileNumber} onChange={handleInputChange} className={errors.mobileNumber ? 'error' : 'NOerror'} disabled={isFormFilled} />
        </label>
        <label>
          Date Of Identify:
          <input
            type="datetime-local" 
            name="dateOfIdentify" 
            value={formData.dateOfIdentify} 
            onChange={handleInputChange} 
            className={errors.dateOfIdentify ? 'error' : 'NOerror'} 
            disabled={isFormFilled} 
          />
        </label>
        <label>
          Description:
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows="4"
            cols="50"
            className={errors.description ? 'error' : ''}
            disabled={isFormFilled}
          />
        </label>
        <label>
          Special Handle:
          <div className="Special-Handle-bar" >
          {(!isFormFilled || formData.specialHandle.includes('option1')) && (<label>
              <input 
                type="checkbox"
                name="option1"
                checked={formData.specialHandle.includes('option1')}
                onChange={handleCheckboxChange}
                disabled={isFormFilled}
              />
              Fragile!!!
            </label>)}
            {(!isFormFilled || formData.specialHandle.includes('option2')) && (<label>
              <input
                type="checkbox"
                name="option2"
                checked={formData.specialHandle.includes('option2')}
                onChange={handleCheckboxChange}
                disabled={isFormFilled}
              />
              Handle With Gloves
            </label>)}
            {(!isFormFilled || formData.specialHandle.includes('option3')) && (<label>
              <input
                type="checkbox"
                name="option3"
                checked={formData.specialHandle.includes('option3')}
                onChange={handleCheckboxChange}
                disabled={isFormFilled}
              />
              Refrigeration is required
            </label>)}
            {(!isFormFilled || formData.specialHandle.includes('option4')) && (<label>
              <input
                type="checkbox"
                name="option4"
                checked={formData.specialHandle.includes('option4')}
                onChange={handleCheckboxChange}
                disabled={isFormFilled}
              />
              Avoid Heat Source
            </label>)}
          </div>
        </label>

        <label>
          Photo:
          <input className="file" type="file" name="photo" onChange={handleFileChange} disabled={isFormFilled} />
          {isFormFilled && formData.photo && <img src={formData.photo} alt="Uploaded" />}
        </label>
        <LocationForm 
          location={formData.location} 
          disabled={isFormFilled} 
          onLocationSelect={handleLocationSelect} 
          onLocationDescChange={handleLocationDescChange} 
        />
        <label>
          Signature:
          <br />
          <canvas ref={signaturePadRef} className={errors.signature ? 'error' : "signature-pad"} disabled={isFormFilled}></canvas>
        </label>
        <div className="signature-buttons">
          <button type="button" onClick={clearSignature} className={errors.signature ? 'error' : "NOerror"} hidden={isFormFilled}>Clear</button>
        </div>
        <button type="submit" hidden={isFormFilled}>{SubmitUpdate}</button>
        {role === 'manager' && isFormFilled && (
          <div>
            <button type="button" onClick={enableEditing}>Edit Form</button>
            <button type="button" onClick={() => handleDelete(false)} style={{ backgroundColor: 'red', color: 'white', cursor: 'pointer' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'darkred'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'red'}>Delete Form</button>
          </div>
        )}
      </form>
    </div>
  );
});

export default AdmissionForm;


