import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import useStore from '../store/useStore';
import './ExpenseCharts.css';

const COLORS = {
  fixed: '#ef4444',
  variable: '#f59e0b',
  event: '#8b5cf6',
  giving: '#10b981',
  investment: '#06b6d4',
  surplus: '#14b8a6'
};

const LABEL_MAP = {
  fixed: '고정 지출',
  variable: '변동 지출',
  event: '경조사/선물',
  giving: '드림/나눔',
  investment: '저축/투자',
  surplus: '여유 자금'
};

function ExpenseCharts() {
  const categories = useStore(state => state.categories);
  const getTotals = useStore(state => state.getTotals);
  const { totalIncome, categoryTotals, surplus } = getTotals();

  const pieData = Object.entries(categoryTotals)
    .filter(([key, value]) => key !== 'income' && value > 0)
    .map(([key, value]) => ({
      name: LABEL_MAP[key],
      value,
      color: COLORS[key]
    }));

  if (surplus > 0) {
    pieData.push({
      name: LABEL_MAP['surplus'],
      value: surplus,
      color: COLORS['surplus']
    });
  }

  const barData = pieData.map(item => ({
    name: item.name,
    percentage: parseFloat((totalIncome > 0 ? ((item.value / totalIncome) * 100) : 0).toFixed(1)),
    fill: item.color
  }));

  return (
    <div className="charts-container">
      <div className="chart-widget">
        <h3>월 소비 비율 (Pie Chart)</h3>
        <div className="pie-chart-wrapper">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value.toLocaleString()} 원`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-legend">
          {pieData.map(item => (
            <div key={item.name} className="legend-item">
              <span className="color-dot" style={{ backgroundColor: item.color }}></span>
              <span className="legend-name">{item.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="chart-widget mt-4">
        <h3>소비 비율 % (Bar Chart)</h3>
        <div className="bar-chart-wrapper">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" unit="%" domain={[0, 100]} />
              <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => `${value}%`} />
              <Bar dataKey="percentage" radius={[0, 4, 4, 0]}>
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default ExpenseCharts;
