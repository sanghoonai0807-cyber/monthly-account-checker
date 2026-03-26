import React, { useState } from 'react';
import useStore from '../store/useStore';
import { Plus, Trash2 } from 'lucide-react';
import './StickyNotes.css';

function StickyNotes() {
  const principles = useStore(state => state.principles);
  const addPrinciple = useStore(state => state.addPrinciple);
  const deletePrinciple = useStore(state => state.deletePrinciple);
  
  const [newText, setNewText] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newText.trim()) return;
    addPrinciple(newText);
    setNewText('');
  };

  return (
    <div className="sticky-notes-container">
      <h3>💡 My Financial Principles</h3>
      <div className="notes-grid">
        {principles.map(p => (
          <div key={p.id} className="sticky-note">
            <p>{p.text}</p>
            <button className="del-note-btn" onClick={() => deletePrinciple(p.id)}>
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
      
      <form className="add-note-form" onSubmit={handleAdd}>
        <input 
          type="text" 
          value={newText} 
          onChange={(e) => setNewText(e.target.value)}
          placeholder="나만의 재테크 원칙을 적어보세요..."
          className="note-input"
        />
        <button type="submit" className="add-btn">
          <Plus size={18} />
        </button>
      </form>
    </div>
  );
}

export default StickyNotes;
