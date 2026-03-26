import React, { useState } from 'react';
import useStore from '../store/useStore';
import { Plus, Trash2 } from 'lucide-react';
import './CategoryCard.css';

const categoryLabels = {
  income: '수입 (Income)',
  fixed: '고정 지출 (Fixed)',
  variable: '변동 지출 (Variable)',
  event: '경조사/선물 (Event)',
  giving: '드림/나눔 (Giving)',
  investment: '저축/투자 (Investment)'
};

const categoryColors = {
  income: 'var(--income-color)',
  fixed: 'var(--fixed-color)',
  variable: 'var(--variable-color)',
  event: 'var(--event-color)',
  giving: 'var(--giving-color)',
  investment: 'var(--investment-color)'
};

function CategoryCard({ categoryKey }) {
  const items = useStore(state => state.categories[categoryKey]);
  const addItem = useStore(state => state.addItem);
  const updateItem = useStore(state => state.updateItem);
  const deleteItem = useStore(state => state.deleteItem);

  const [newItemName, setNewItemName] = useState('');
  const [newItemAmount, setNewItemAmount] = useState('');

  const total = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newItemName || !newItemAmount) return;
    addItem(categoryKey, { name: newItemName, amount: Number(newItemAmount) });
    setNewItemName('');
    setNewItemAmount('');
  };

  return (
    <div className="category-card" style={{ borderTopColor: categoryColors[categoryKey] }}>
      <div className="card-header">
        <h3>{categoryLabels[categoryKey]}</h3>
        <span className="category-total">{total.toLocaleString()} 원</span>
      </div>
      
      <div className="items-list">
        {items.map(item => (
          <div key={item.id} className="item-row">
            <input 
              type="text" 
              value={item.name} 
              onChange={(e) => updateItem(categoryKey, item.id, { name: e.target.value })}
              className="item-input name-input"
            />
            <input 
              type="number" 
              value={item.amount} 
              onChange={(e) => updateItem(categoryKey, item.id, { amount: e.target.value })}
              className="item-input amount-input"
            />
            <button className="del-btn" onClick={() => deleteItem(categoryKey, item.id)}>
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      <form className="add-item-form" onSubmit={handleAdd}>
        <input 
          type="text" 
          placeholder="항목명" 
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          className="item-input name-input"
        />
        <input 
          type="number" 
          placeholder="금액" 
          value={newItemAmount}
          onChange={(e) => setNewItemAmount(e.target.value)}
          className="item-input amount-input"
        />
        <button type="submit" className="add-btn">
          <Plus size={16} />
        </button>
      </form>
    </div>
  );
}

export default CategoryCard;
