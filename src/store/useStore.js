import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

const initialData = {
  income: [
    { id: uuidv4(), name: '월급', amount: 3000000 },
    { id: uuidv4(), name: '수당', amount: 200000 }
  ],
  fixed: [
    { id: uuidv4(), name: '통신비', amount: 50000 },
    { id: uuidv4(), name: '보험료', amount: 150000 },
    { id: uuidv4(), name: '주거비 (월세/대출)', amount: 500000 }
  ],
  variable: [
    { id: uuidv4(), name: '식비', amount: 400000 },
    { id: uuidv4(), name: '교통비', amount: 100000 },
    { id: uuidv4(), name: '여가비', amount: 150000 }
  ],
  event: [
    { id: uuidv4(), name: '경조사비', amount: 100000 }
  ],
  giving: [
    { id: uuidv4(), name: '기부금', amount: 50000 }
  ],
  investment: [
    { id: uuidv4(), name: '연금저축', amount: 300000 },
    { id: uuidv4(), name: 'ISA', amount: 500000 },
    { id: uuidv4(), name: '청약', amount: 100000 }
  ]
};

const useStore = create((set, get) => ({
  categories: initialData,
  principles: [
    { id: uuidv4(), text: '평균보다 소득이 많은 달은 전액 ISA 투자!' },
    { id: uuidv4(), text: '비상금은 6개월 치 생활비를 유지한다.' }
  ],
  
  // Actions for Categories
  addItem: (categoryKey, item) => set((state) => ({
    categories: {
      ...state.categories,
      [categoryKey]: [...state.categories[categoryKey], { ...item, id: uuidv4() }]
    }
  })),
  
  updateItem: (categoryKey, id, updatedFields) => set((state) => ({
    categories: {
      ...state.categories,
      [categoryKey]: state.categories[categoryKey].map(item => 
        item.id === id ? { ...item, ...updatedFields } : item
      )
    }
  })),
  
  deleteItem: (categoryKey, id) => set((state) => ({
    categories: {
      ...state.categories,
      [categoryKey]: state.categories[categoryKey].filter(item => item.id !== id)
    }
  })),

  // Action for importing from Excel
  setCategories: (newCategories) => set({ categories: newCategories }),
  setPrinciples: (newPrinciples) => set({ principles: newPrinciples }),

  // Actions for Principles
  addPrinciple: (text) => set((state) => ({
    principles: [...state.principles, { id: uuidv4(), text }]
  })),

  updatePrinciple: (id, text) => set((state) => ({
    principles: state.principles.map(p => p.id === id ? { ...p, text } : p)
  })),

  deletePrinciple: (id) => set((state) => ({
    principles: state.principles.filter(p => p.id !== id)
  })),

  // Derived Values (Getters)
  getTotals: () => {
    const state = get();
    const sumCategory = (key) => state.categories[key].reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    
    const totalIncome = sumCategory('income');
    const totalFixed = sumCategory('fixed');
    const totalVariable = sumCategory('variable');
    const totalEvent = sumCategory('event');
    const totalGiving = sumCategory('giving');
    const totalInvestment = sumCategory('investment');
    
    const totalExpenses = totalFixed + totalVariable + totalEvent + totalGiving;
    const surplus = totalIncome - totalExpenses - totalInvestment;
    
    // Emergency fund calculation logic (3 months & 6 months of fixed + variable)
    const monthlyRequired = totalFixed + totalVariable;
    const target3Months = monthlyRequired * 3;
    const target6Months = monthlyRequired * 6;

    return {
      totalIncome,
      totalExpenses,
      totalInvestment,
      surplus,
      categoryTotals: {
        income: totalIncome,
        fixed: totalFixed,
        variable: totalVariable,
        event: totalEvent,
        giving: totalGiving,
        investment: totalInvestment
      },
      emergency: {
        target3Months,
        target6Months
      }
    };
  }
}));

export default useStore;
