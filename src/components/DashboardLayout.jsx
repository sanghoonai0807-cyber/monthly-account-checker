import React, { useRef } from 'react';
import CategoryCard from './CategoryCard';
import useStore from '../store/useStore';
import ExpenseCharts from './ExpenseCharts';
import StickyNotes from './StickyNotes';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { v4 as uuidv4 } from 'uuid';
import './DashboardLayout.css';

function DashboardLayout() {
  const getTotals = useStore(state => state.getTotals);
  const categories = useStore(state => state.categories);
  const setCategories = useStore(state => state.setCategories);
  const principles = useStore(state => state.principles);
  const setPrinciples = useStore(state => state.setPrinciples);
  const totals = getTotals();

  const generatePieChartBase64 = (totalsData) => {
    const scale = 2;
    const width = 500;
    const height = 320;
    
    const canvas = document.createElement('canvas');
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);
    
    const { categoryTotals, surplus, totalExpenses } = totalsData;
    const pieData = Object.entries(categoryTotals)
      .filter(([key, value]) => key !== 'income' && value > 0)
      .map(([key, value]) => ({ key, value }));
      
    if (surplus > 0) {
      pieData.push({ key: 'surplus', value: surplus });
    }

    const total = pieData.reduce((s, item) => s + item.value, 0);
    
    const colors = {
      fixed: '#ef4444',
      variable: '#f59e0b',
      event: '#8b5cf6',
      giving: '#10b981',
      investment: '#06b6d4',
      surplus: '#14b8a6'
    };
    const labels = {
      fixed: '고정 지출',
      variable: '변동 지출',
      event: '경조사/선물',
      giving: '드림/나눔',
      investment: '저축/투자',
      surplus: '여유 자금'
    };

    // Background Container (rounded rectangle)
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.05)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 4;
    ctx.beginPath();
    ctx.roundRect(5, 5, width - 10, height - 10, 16);
    ctx.fill();
    ctx.shadowColor = 'transparent'; // reset

    // Title
    ctx.font = 'bold 18px "맑은 고딕", sans-serif';
    ctx.fillStyle = '#1e293b';
    ctx.fillText('📊 소비 비율 및 여유 자금', 30, 40);
    
    // Subtext
    ctx.font = '13px "맑은 고딕", sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('현재 달성 현황 및 잔여 자금 요약', 30, 60);

    if (total === 0) return canvas.toDataURL('image/png');

    let currentAngle = -0.5 * Math.PI;
    const cx = 140, cy = 185, radius = 95;

    // Draw Pie Slices
    pieData.forEach(({ key, value }, i) => {
      const sliceAngle = (value / total) * 2 * Math.PI;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, currentAngle, currentAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = colors[key] || '#cccccc';
      ctx.fill();
      // add a light border for slices
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
      currentAngle += sliceAngle;
    });

    // Draw Inner Circle for Donut
    ctx.beginPath();
    ctx.arc(cx, cy, 65, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // Inner text for Donut
    ctx.textAlign = 'center';
    ctx.font = 'bold 14px "맑은 고딕", sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('전체 지출', cx, cy - 10);
    ctx.font = 'bold 16px "맑은 고딕", sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.fillText(`${(totalExpenses || 0).toLocaleString()} ₩`, cx, cy + 15);
    ctx.textAlign = 'left';  // reset

    // Draw Legend
    ctx.font = '14px "맑은 고딕", sans-serif';
    let legendY = 90;
    pieData.forEach(({ key, value }) => {
      ctx.fillStyle = colors[key] || '#cccccc';
      ctx.beginPath();
      ctx.roundRect(290, legendY - 12, 16, 16, 4);
      ctx.fill();
      
      ctx.fillStyle = '#334155';
      const percent = ((value / total) * 100).toFixed(1);
      ctx.fillText(`${labels[key] || key}`, 316, legendY);
      
      // Right align percentage
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'right';
      ctx.fillText(`(${percent}%)`, 450, legendY);
      ctx.textAlign = 'left';
      
      legendY += 30;
    });

    return canvas.toDataURL('image/png');
  };

  const generatePrinciplesImageBase64 = (principlesList) => {
    const scale = 2;
    const width = 450;
    const height = 320;
    
    const canvas = document.createElement('canvas');
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);

    // shadow for sticky note
    ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 8;
    
    // Sticky Note Background (Soft yellow gradient simulation)
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#fef08a');
    gradient.addColorStop(1, '#fde047');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(10, 10, width - 20, height - 20, 8);
    ctx.fill();
    
    // reset shadow for inner content
    ctx.shadowColor = 'transparent';
    
    // Tape element on top middle
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.roundRect(width / 2 - 45, 0, 90, 28, 4);
    ctx.fill();

    // Pin icon or header
    ctx.font = 'bold 22px "맑은 고딕", sans-serif';
    ctx.fillStyle = '#1e293b';
    ctx.fillText('📌 나의 금융 원칙', 30, 60);

    // Line under header
    ctx.beginPath();
    ctx.moveTo(30, 75);
    ctx.lineTo(width - 30, 75);
    ctx.strokeStyle = 'rgba(234, 179, 8, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Principles text
    ctx.font = '16px "맑은 고딕", sans-serif';
    ctx.fillStyle = '#334155';
    let y = 110;
    
    principlesList.forEach((p, index) => {
      const text = `${index + 1}. ${p.text}`;
      const maxCharsPerLine = 22; // adjusted for width
      
      let currentIdx = 0;
      while (currentIdx < text.length) {
        let lineText = text.slice(currentIdx, currentIdx + maxCharsPerLine);
        ctx.fillText(lineText, 40, y);
        y += 28;
        currentIdx += maxCharsPerLine;
      }
      y += 12; // Extra spacing between items
    });

    return canvas.toDataURL('image/png');
  };

  const exportToExcel = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      workbook.creator = '청지기 금융 가계부';
      workbook.created = new Date();

      // ============== 1. 요약 시트 ==============
      const summarySheet = workbook.addWorksheet('요약 대시보드', {
        properties: { tabColor: { argb: 'FF14B8A6' } },
        views: [{ showGridLines: false }]
      });

      summarySheet.columns = [
        { header: '', key: 'empty', width: 3 },
        { header: '항목', key: 'item', width: 28 },
        { header: '금액', key: 'amount', width: 22 },
        { header: '', key: 'space', width: 4 }, // spacer
      ];

      summarySheet.mergeCells('B2:C2');
      const titleCell = summarySheet.getCell('B2');
      titleCell.value = '💎 프리미엄 금융 대시보드';
      titleCell.font = { name: '맑은 고딕', size: 18, bold: true, color: { argb: 'FFFFFFFF' } };
      titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
      titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
      summarySheet.getRow(2).height = 45;

      const summaryData = [
        { item: '총 수입 (Income)', formula: 'SUMIF(\'상세 내역\'!A:A, "💰 수입", \'상세 내역\'!C:C)', result: totals.totalIncome, color: 'FF3B82F6' },
        { item: '총 지출 (Expenses)', formula: 'SUM(\'상세 내역\'!C:C) - SUMIF(\'상세 내역\'!A:A, "💰 수입", \'상세 내역\'!C:C) - SUMIF(\'상세 내역\'!A:A, "📈 저축/투자", \'상세 내역\'!C:C)', result: totals.totalExpenses, color: 'FFEF4444' },
        { item: '저축/투자 (Investment)', formula: 'SUMIF(\'상세 내역\'!A:A, "📈 저축/투자", \'상세 내역\'!C:C)', result: totals.totalInvestment, color: 'FF06B6D4' },
        { item: '추가 여유자금 (Surplus)', formula: 'C4-C6-C8', result: totals.surplus, color: 'FF10B981' },
      ];

      let currentRow = 4;
      summaryData.forEach((row) => {
        const itemCell = summarySheet.getCell(`B${currentRow}`);
        const amountCell = summarySheet.getCell(`C${currentRow}`);
        
        itemCell.value = row.item;
        amountCell.value = { formula: row.formula, result: row.result };

        itemCell.font = { name: '맑은 고딕', size: 13, bold: true, color: { argb: row.color } };
        amountCell.font = { name: '맑은 고딕', size: 14, bold: true };
        amountCell.numFmt = '#,##0" 원"';
        
        itemCell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
        amountCell.alignment = { horizontal: 'right', vertical: 'middle' };

        summarySheet.getRow(currentRow).height = 35;

        [itemCell, amountCell].forEach(cell => {
          cell.border = { bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
        });

        currentRow += 2;
      });

      // 비상금 섹션
      currentRow += 1;
      summarySheet.mergeCells(`B${currentRow}:C${currentRow}`);
      const emTitleCell = summarySheet.getCell(`B${currentRow}`);
      emTitleCell.value = '🛡️ 비상금 자금 목표';
      emTitleCell.font = { name: '맑은 고딕', size: 14, bold: true, color: { argb: 'FF1E293B' } };
      emTitleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
      emTitleCell.alignment = { vertical: 'middle', horizontal: 'center' };
      summarySheet.getRow(currentRow).height = 38;
      
      currentRow += 2;

      summarySheet.getCell(`B${currentRow}`).value = '3개월 생활비 지출 방어';
      summarySheet.getCell(`C${currentRow}`).value = {
        formula: '(SUMIF(\'상세 내역\'!A:A, "🏠 고정 지출", \'상세 내역\'!C:C) + SUMIF(\'상세 내역\'!A:A, "🍔 변동 지출", \'상세 내역\'!C:C)) * 3',
        result: totals.emergency.target3Months
      };
      summarySheet.getCell(`B${currentRow+1}`).value = '6개월 생활비 지출 방어';
      summarySheet.getCell(`C${currentRow+1}`).value = {
        formula: '(SUMIF(\'상세 내역\'!A:A, "🏠 고정 지출", \'상세 내역\'!C:C) + SUMIF(\'상세 내역\'!A:A, "🍔 변동 지출", \'상세 내역\'!C:C)) * 6',
        result: totals.emergency.target6Months
      };

      [1, 2].forEach(i => {
        const rIndex = currentRow + i - 1;
        summarySheet.getRow(rIndex).height = 30;
        const itemCell = summarySheet.getCell(`B${rIndex}`);
        const amountCell = summarySheet.getCell(`C${rIndex}`);
        
        itemCell.font = { name: '맑은 고딕', size: 12, color: { argb: 'FF475569' } };
        itemCell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
        
        amountCell.font = { name: '맑은 고딕', size: 13, bold: true, color: { argb: 'FF3B82F6' } };
        amountCell.numFmt = '#,##0" 원"';
        amountCell.alignment = { horizontal: 'right', vertical: 'middle' };
        
        [itemCell, amountCell].forEach(cell => {
          cell.border = { bottom: { style: 'thin', color: { argb: 'FFF1F5F9' } } };
        });
      });

      // --- 차트 이미지 삽입 ---
      const base64Image = generatePieChartBase64(totals);
      const imageId = workbook.addImage({
        base64: base64Image,
        extension: 'png',
      });
      summarySheet.addImage(imageId, {
        tl: { col: 4, row: 3 }, // E4
        ext: { width: 480, height: 300 }
      });

      // --- 나의 금융 원칙 이미지 삽입 ---
      const principlesBase64 = generatePrinciplesImageBase64(principles);
      const principlesImageId = workbook.addImage({
        base64: principlesBase64,
        extension: 'png',
      });
      summarySheet.addImage(principlesImageId, {
        tl: { col: 1, row: currentRow + 2 }, // B(currentRow+3)
        ext: { width: 420, height: 280 }
      });


      // ============== 2. 상세 내역 시트 ==============
      const detailSheet = workbook.addWorksheet('상세 내역', {
        properties: { tabColor: { argb: 'FF3B82F6' } }
      });

      detailSheet.columns = [
        { header: '분류', key: 'category', width: 22 },
        { header: '항목명', key: 'name', width: 35 },
        { header: '금액(원)', key: 'amount', width: 25 },
      ];

      const headerRow = detailSheet.getRow(1);
      headerRow.font = { name: '맑은 고딕', bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
      headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
      headerRow.height = 30;

      const categoryLabels = {
        income: '💰 수입',
        fixed: '🏠 고정 지출',
        variable: '🍔 변동 지출',
        event: '🎁 경조사/선물',
        giving: '💖 드림/나눔',
        investment: '📈 저축/투자'
      };

      const categoryColors = {
        income: 'FFEFF6FF',
        fixed: 'FFFEF2F2',
        variable: 'FFFFFBEB',
        event: 'FFF5F3FF',
        giving: 'FFECFDF5',
        investment: 'FFECFEFF'
      };

      let startRow = 2;
      Object.keys(categories).forEach(cat => {
        categories[cat].forEach(item => {
          const row = detailSheet.addRow({
            category: categoryLabels[cat] || cat,
            name: item.name,
            amount: Number(item.amount) || 0
          });

          row.getCell('amount').numFmt = '#,##0" ₩"';
          
          row.eachCell((cell) => {
            cell.font = { name: '맑은 고딕', size: 11 };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: categoryColors[cat] || 'FFFFFFFF' } };
            cell.border = {
              top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
              bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
              left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
              right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
            };
          });
          startRow++;
        });
      });

      // 금액 컬럼에 조건부 서식(데이터 막대) 적용
      if (startRow > 2) {
        detailSheet.addConditionalFormatting({
          ref: `C2:C${startRow - 1}`,
          rules: [
            {
              type: 'dataBar',
              cfvo: [{ type: 'min' }, { type: 'max' }],
              color: { argb: 'FF93C5FD' }, // Soft Blue Gradient Bar
              gradient: true,
              border: false
            }
          ]
        });
      }

      // ============== 3. 숨김 데이터 시트 (복원용) ==============
      const hiddenSheet = workbook.addWorksheet('_hidden_data', { state: 'hidden' });
      principles.forEach(p => hiddenSheet.addRow(['principle', p.id, p.text]));

      // 최종 다운로드
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      const fileName = "청지기_금융_가계부.xlsx";
      const file = new File([blob], fileName, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: '청지기 금융 가계부',
            text: '가계부 엑셀 데이터입니다.'
          });
        } catch (error) {
          console.log("공유가 취소되었거나 지원되지 않습니다. 기본 다운로드를 시도합니다.", error);
          saveAs(blob, fileName);
        }
      } else {
        saveAs(blob, fileName);
      }

    } catch (error) {
      console.error("Excel export error:", error);
      alert("엑셀 다운로드 중 오류가 발생했습니다. 브라우저 콘솔을 확인해주세요.");
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(arrayBuffer);

      const detailSheet = workbook.getWorksheet('상세 내역');
      if (!detailSheet) {
        alert("업로드한 파일에 '상세 내역' 시트가 없습니다.");
        return;
      }

      const reverseCategoryLabels = {
        '💰 수입': 'income',
        '🏠 고정 지출': 'fixed',
        '🍔 변동 지출': 'variable',
        '🎁 경조사/선물': 'event',
        '💖 드림/나눔': 'giving',
        '📈 저축/투자': 'investment'
      };

      const newCategories = {
        income: [],
        fixed: [],
        variable: [],
        event: [],
        giving: [],
        investment: []
      };

      detailSheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header

        const categoryLabel = row.getCell(1).value;
        const name = row.getCell(2).value;
        const amount = Number(row.getCell(3).value);

        const categoryKey = reverseCategoryLabels[categoryLabel] || null;
        if (categoryKey && name && !isNaN(amount)) {
          newCategories[categoryKey].push({
            id: uuidv4(),
            name: name,
            amount: amount
          });
        }
      });

      setCategories(newCategories);

      // Restore principles if available
      const hiddenSheet = workbook.getWorksheet('_hidden_data');
      if (hiddenSheet) {
        const importedPrinciples = [];
        hiddenSheet.eachRow(row => {
          if (row.getCell(1).value === 'principle') {
            importedPrinciples.push({
              id: row.getCell(2).value || uuidv4(),
              text: row.getCell(3).value
            });
          }
        });
        if (importedPrinciples.length > 0) {
          setPrinciples(importedPrinciples);
        }
      }

      alert("데이터를 성공적으로 불러왔습니다!");
      
    } catch (error) {
      console.error("Excel import error:", error);
      alert("파일을 읽는 중 오류가 발생했습니다.");
    }
    
    // reset input
    e.target.value = null;
  };

  return (
    <div className="dashboard-layout">
      <header className="dashboard-header">
        <div>
          <h1>청지기 금융 가계부</h1>
        </div>
        <div className="header-actions">
          <input 
            id="excel-upload-input"
            type="file" 
            accept=".xlsx, .xls" 
            style={{ display: 'none' }} 
            onChange={handleFileUpload}
          />
          <label className="import-btn" htmlFor="excel-upload-input">
            Excel 업로드
          </label>
          <button className="export-btn" onClick={exportToExcel}>Excel 다운로드</button>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="left-panel">
          <CategoryCard categoryKey="income" />
          <CategoryCard categoryKey="fixed" />
          <CategoryCard categoryKey="variable" />
          <CategoryCard categoryKey="event" />
          <CategoryCard categoryKey="giving" />
          <CategoryCard categoryKey="investment" />
          
          <StickyNotes />
        </div>
        
        <div className="right-panel">
          <div className="summary-widgets">
            <div className="placeholder-widget">
              <h3>여유 자금 (Surplus)</h3>
              <div className="amount highlight">{totals.surplus.toLocaleString()} 원</div>
            </div>
            <div className="placeholder-widget">
              <h3>저축/투자 (Investment)</h3>
              <div className="amount highlight-investment">{totals.totalInvestment.toLocaleString()} 원</div>
            </div>
            <div className="placeholder-widget">
              <h3>비상금 목표 (3개월)</h3>
              <div className="amount">{totals.emergency.target3Months.toLocaleString()} 원</div>
            </div>
            <div className="placeholder-widget">
              <h3>비상금 목표 (6개월)</h3>
              <div className="amount">{totals.emergency.target6Months.toLocaleString()} 원</div>
            </div>
          </div>
          
          <ExpenseCharts />
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;
