document.addEventListener('DOMContentLoaded', () => {
  const ctx = document.getElementById('qualityEvolutionChart').getContext('2d');
  const npsPieCanvas = document.getElementById('npsPieChart');
  let npsPieChart = null;

  if (npsPieCanvas) {
    const npsCtx = npsPieCanvas.getContext('2d');
    npsPieChart = new Chart(npsCtx, {
      type: 'doughnut',
      data: {
        labels: ['Promotores', 'Neutros', 'Detratores'],
        datasets: [{
          data: [78, 14, 8],
          backgroundColor: ['#22c55e', '#facc15', '#f87171'],
          borderWidth: 2,
          borderColor: '#ffffff',
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        cutout: '72%',
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: '#0f172a',
            titleFont: { family: 'Inter', size: 11 },
            bodyFont: { family: 'Inter', size: 11 },
            padding: 8,
            cornerRadius: 6,
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const val = context.parsed;
                return ` ${label}: ${Number(val).toFixed(1)}%`;
              }
            }
          }
        }
      }
    });
  }

  // Reference labels and data (matching reference design for initial display)
  const defaultLabels = ['Jan/25', 'Fev/25', 'Mar/25', 'Abr/25', 'Mai/25', 'Jun/25', 'Jul/25', 'Ago/25', 'Set/25'];
  const defaultQuality = [81, 86, 87, 87, 91, 90, 89, 89, 91];       // Blue line (ends at 91%)
  const defaultSatisfaction = [63, 65, 65, 68, 71, 70, 70, 70, 68];  // Green line (approx 8.7 mapped or scaled)
  const defaultProblems = [13, 10, 8, 9, 7, 7, 6, 6, 6.4];           // Orange line (ends at 6.4%)

  // Store original satisfaction values (0-10) for tooltip and endpoint pill display
  let lastRealSatisfactionValues = [6.3, 6.5, 6.5, 6.8, 7.1, 7.0, 7.0, 7.0, 8.7];

  // Custom plugin to render exact endpoints labels dynamically
  const endpointLabelsPlugin = {
    id: 'endpointLabels',
    afterDatasetsDraw(chart) {
      const { ctx } = chart;
      chart.data.datasets.forEach((dataset, index) => {
        const meta = chart.getDatasetMeta(index);
        const dataArr = dataset.data;
        if (!dataArr || dataArr.length === 0) return;

        // Find last non-null point
        let lastIdx = dataArr.length - 1;
        while (lastIdx >= 0 && (dataArr[lastIdx] === null || dataArr[lastIdx] === undefined || isNaN(dataArr[lastIdx]))) {
          lastIdx--;
        }
        if (lastIdx < 0) return;

        const lastPoint = meta.data[lastIdx];
        const lastVal = dataArr[lastIdx];

        if (lastPoint && lastVal !== undefined && lastVal !== null) {
          ctx.save();
          let labelText = '';
          let bgColor = dataset.borderColor;
          let textColor = '#ffffff';

          if (index === 0) {
            // Índice de Qualidade: %
            labelText = Number(lastVal).toFixed(0) + '%';
          } else if (index === 1) {
            // Satisfação média: nota de 0 a 10 (ex: 8,7)
            const realVal = (lastRealSatisfactionValues && lastRealSatisfactionValues[lastIdx] !== undefined)
              ? lastRealSatisfactionValues[lastIdx]
              : (lastVal / 10);
            labelText = Number(realVal).toFixed(1).replace('.', ',');
          } else if (index === 2) {
            // % Problemas: %
            const decPlaces = Number(lastVal) % 1 !== 0 ? 1 : 0;
            labelText = Number(lastVal).toFixed(decPlaces).replace('.', ',') + '%';
          }

          ctx.font = 'bold 10px Inter, sans-serif';
          const textWidth = ctx.measureText(labelText).width;
          const padding = 5;
          const rectWidth = textWidth + padding * 2;
          const rectHeight = 16;
          const x = lastPoint.x + 8;
          // Clamp pill vertically within canvas boundaries so it is never clipped
          const chartArea = chart.chartArea;
          let y = lastPoint.y - rectHeight / 2;
          if (chartArea) {
            y = Math.max(chartArea.top, Math.min(chartArea.bottom - rectHeight, y));
          }

          // Draw rounded pill background
          ctx.fillStyle = bgColor;
          ctx.beginPath();
          ctx.roundRect(x, y, rectWidth, rectHeight, 4);
          ctx.fill();

          // Draw text
          ctx.fillStyle = textColor;
          ctx.textBaseline = 'middle';
          ctx.fillText(labelText, x + padding, y + rectHeight / 2);
          ctx.restore();
        }
      });
    }
  };

  const chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: defaultLabels,
      datasets: [
        {
          label: 'Índice de Qualidade',
          data: defaultQuality,
          borderColor: '#2563eb',
          backgroundColor: '#2563eb',
          borderWidth: 2,
          pointRadius: 4,
          pointBackgroundColor: '#2563eb',
          pointHoverRadius: 6,
          tension: 0.3,
          fill: false
        },
        {
          label: 'Satisfação média',
          data: defaultSatisfaction,
          borderColor: '#22c55e',
          backgroundColor: '#22c55e',
          borderWidth: 2,
          pointRadius: 4,
          pointBackgroundColor: '#22c55e',
          pointHoverRadius: 6,
          tension: 0.3,
          fill: false
        },
        {
          label: '% Problemas',
          data: defaultProblems,
          borderColor: '#f97316',
          backgroundColor: '#f97316',
          borderWidth: 2,
          pointRadius: 4,
          pointBackgroundColor: '#f97316',
          pointHoverRadius: 6,
          tension: 0.3,
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          top: 18,
          bottom: 16,
          left: 14,
          right: 58
        }
      },
      plugins: {
        legend: {
          display: false // We use custom HTML legend beneath the chart matching the original design
        },
        tooltip: {
          backgroundColor: '#0f172a',
          titleFont: { family: 'Inter', size: 11 },
          bodyFont: { family: 'Inter', size: 11 },
          padding: 8,
          cornerRadius: 6,
          callbacks: {
            label: function(context) {
              const datasetIdx = context.datasetIndex;
              const val = context.parsed.y;
              if (datasetIdx === 0) {
                return `Índice de Qualidade: ${val.toFixed(1).replace('.', ',')}%`;
              } else if (datasetIdx === 1) {
                const realVal = (lastRealSatisfactionValues && lastRealSatisfactionValues[context.dataIndex] !== undefined)
                  ? lastRealSatisfactionValues[context.dataIndex]
                  : (val / 10);
                return `Satisfação média: ${Number(realVal).toFixed(1).replace('.', ',')} (escala 0-10)`;
              } else if (datasetIdx === 2) {
                return `% Problemas: ${val.toFixed(1).replace('.', ',')}%`;
              }
              return `${context.dataset.label}: ${val}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false,
            drawBorder: false
          },
          ticks: {
            font: { family: 'Inter', size: 10 },
            color: '#64748b'
          }
        },
        y: {
          min: -8,
          max: 108,
          ticks: {
            stepSize: 20,
            callback: function(value) {
              if (value < 0 || value > 100) return '';
              return value + '%';
            },
            font: { family: 'Inter', size: 10 },
            color: '#64748b'
          },
          grid: {
            color: '#f1f5f9',
            drawBorder: false
          }
        }
      }
    },
    plugins: [endpointLabelsPlugin]
  });

  // Simple interactive toggle for the segmented control buttons
  const buttons = document.querySelectorAll('.seg-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Upload Dropzone events (drag & drop and file selection UI feedback)
  const dropzone = document.getElementById('uploadDropzone');
  const fileInput = document.getElementById('fileInput');
  const fileSelectName = document.getElementById('fileSelectName');
  const fileSelectSub = document.getElementById('fileSelectSub');
  const btnConfirmFile = document.getElementById('btnConfirmFile');

  if (dropzone && fileInput) {
    dropzone.addEventListener('click', () => {
      fileInput.click();
    });

    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove('dragover');
      });
    });

    dropzone.addEventListener('drop', (e) => {
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        fileInput.files = files;
        updateDropzoneUI(files[0].name);
      }
    });

    fileInput.addEventListener('change', () => {
      if (fileInput.files.length > 0) {
        updateDropzoneUI(fileInput.files[0].name);
      }
    });

    function updateDropzoneUI(fileName) {
      if (fileSelectName) {
        fileSelectName.textContent = fileName;
        fileSelectName.style.color = '#2563eb';
      }
      if (fileSelectSub) {
        fileSelectSub.textContent = 'Clique no botão ao lado para processar os dados';
      }
    }
  }

  // --- Dynamic Spreadsheet Parser & KPI Calculation Engine ---
  if (btnConfirmFile) {
    btnConfirmFile.addEventListener('click', () => {
      if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
        alert('Por favor, selecione um arquivo .csv, .xls ou .xlsx primeiro.');
        return;
      }

      const file = fileInput.files[0];
      const fileName = file.name.toLowerCase();

      // Show processing state in confirm button
      btnConfirmFile.style.opacity = '0.6';
      btnConfirmFile.disabled = true;

      if (fileName.endsWith('.csv')) {
        parseCSVFile(file);
      } else if (fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) {
        parseExcelFile(file);
      } else {
        alert('Formato de arquivo não suportado. Por favor utilize .csv, .xls ou .xlsx');
        btnConfirmFile.style.opacity = '1';
        btnConfirmFile.disabled = false;
      }
    });
  }

  function parseCSVFile(file) {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: 'greedy',
      dynamicTyping: false,
      complete: function(results) {
        btnConfirmFile.style.opacity = '1';
        btnConfirmFile.disabled = false;
        if (results.data && results.data.length > 0) {
          processSheetData(results.data);
        } else {
          alert('Nenhum dado encontrado no arquivo CSV.');
        }
      },
      error: function(err) {
        btnConfirmFile.style.opacity = '1';
        btnConfirmFile.disabled = false;
        alert('Erro ao ler arquivo CSV: ' + err.message);
      }
    });
  }

  function parseExcelFile(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        btnConfirmFile.style.opacity = '1';
        btnConfirmFile.disabled = false;
        if (json && json.length > 0) {
          processSheetData(json);
        } else {
          alert('Nenhum dado encontrado na planilha.');
        }
      } catch (err) {
        btnConfirmFile.style.opacity = '1';
        btnConfirmFile.disabled = false;
        alert('Erro ao processar planilha Excel: ' + err.message);
      }
    };
    reader.onerror = function() {
      btnConfirmFile.style.opacity = '1';
      btnConfirmFile.disabled = false;
      alert('Erro ao carregar o arquivo.');
    };
    reader.readAsArrayBuffer(file);
  }

  // --- Dynamic Spreadsheet Parser & KPI Calculation Engine ---
  let rawSheetRows = [];

  // Helper to find column name in row object case-insensitively / trimmed
  function getVal(row, colName) {
    if (!row) return '';
    if (row[colName] !== undefined) return row[colName];
    const target = colName.trim().toLowerCase();
    for (const key of Object.keys(row)) {
      if (key.trim().toLowerCase() === target) {
        return row[key];
      }
    }
    return '';
  }

  // Helper to parse localized numeric values (e.g. "8,00" or "83,33" or "10")
  function parseNum(val) {
    if (val === null || val === undefined) return NaN;
    if (typeof val === 'number') return val;
    const clean = String(val).replace('%', '').replace(/\s+/g, '').replace(',', '.');
    return parseFloat(clean);
  }

  // Helper to parse dates into Day/Month/Year object & timestamp
  function parseFullDate(str) {
    if (!str) return null;
    if (typeof str === 'number' || (!isNaN(Number(str)) && !String(str).includes('/') && !String(str).includes('-'))) {
      const num = Number(str);
      if (num > 30000 && num < 60000) {
        const d = new Date(Math.round((num - 25569) * 86400 * 1000));
        const day = d.getUTCDate();
        const month = d.getUTCMonth() + 1;
        const year = d.getUTCFullYear();
        const timestamp = new Date(year, month - 1, day).getTime();
        return { day, month, year, timestamp, sortKey: year * 100 + month };
      }
    }

    const clean = String(str).trim().split(' ')[0];
    if (/^\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}$/.test(clean)) {
      const parts = clean.split(/[\/\-]/);
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const day = parseInt(parts[2], 10);
      const timestamp = new Date(year, month - 1, day).getTime();
      return { day, month, year, timestamp, sortKey: year * 100 + month };
    }

    const parts = clean.split(/[\/\-]/);
    if (parts.length !== 3) return null;
    let p0 = parseInt(parts[0], 10);
    let p1 = parseInt(parts[1], 10);
    let p2 = parseInt(parts[2], 10);
    if (isNaN(p0) || isNaN(p1) || isNaN(p2)) return null;
    if (p2 < 100) p2 += 2000;

    let day, month, year;
    if (p0 > 12) {
      day = p0;
      month = p1;
      year = p2;
    } else if (p1 > 12) {
      month = p0;
      day = p1;
      year = p2;
    } else {
      day = p0;
      month = p1;
      year = p2;
    }
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;
    const timestamp = new Date(year, month - 1, day).getTime();
    return { day, month, year, timestamp, sortKey: year * 100 + month };
  }

  // Helper to parse dates into month/year object
  function parseDateToMonthYear(str) {
    const full = parseFullDate(str);
    if (!full) return null;
    return { month: full.month, year: full.year, sortKey: full.sortKey };
  }

  const monthNamesPt = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  // Filter elements
  const filterKeys = ['loja', 'uf', 'regional', 'analista', 'fornecedor', 'modalidade'];
  const filterColMap = {
    loja: 'Loja',
    uf: 'UF',
    regional: 'Regional',
    analista: 'Analista',
    fornecedor: 'Fornecedor',
    modalidade: 'Modalidade'
  };
  const filterDefaultLabels = {
    loja: 'Todas',
    uf: 'Todas',
    regional: 'Todas',
    analista: 'Todos',
    fornecedor: 'Todos',
    modalidade: 'Todas'
  };

  const filterSelects = {
    loja: document.getElementById('filterLoja'),
    uf: document.getElementById('filterUF'),
    regional: document.getElementById('filterRegional'),
    analista: document.getElementById('filterAnalista'),
    fornecedor: document.getElementById('filterFornecedor'),
    modalidade: document.getElementById('filterModalidade')
  };

  // Date Filter Range state: { start: timestamp|null, end: timestamp|null }
  let dateRangeFilter = { start: null, end: null };
  let calendarViewDate = new Date(); // Month and year currently displayed in the calendar
  let tempClickState = null; // null | firstClickTimestamp (for picking start then end)

  // Calendar UI DOM elements
  const dateBadgeBtn = document.getElementById('dateBadgeBtn');
  const calendarPopover = document.getElementById('calendarPopover');
  const headerDateRange = document.getElementById('headerDateRange');
  const calPrevMonth = document.getElementById('calPrevMonth');
  const calNextMonth = document.getElementById('calNextMonth');
  const calMonthDisplay = document.getElementById('calMonthDisplay');
  const calYearDisplay = document.getElementById('calYearDisplay');
  const calDaysGrid = document.getElementById('calDaysGrid');
  const presetThisMonth = document.getElementById('presetThisMonth');
  const presetThisYear = document.getElementById('presetThisYear');
  const presetAllTime = document.getElementById('presetAllTime');

  const monthNamesLongPt = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  function formatShortDatePt(d) {
    if (!d) return '';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  function updateDateBadgeDisplay() {
    if (!headerDateRange) return;
    if (dateRangeFilter.start && dateRangeFilter.end) {
      const s = new Date(dateRangeFilter.start);
      const e = new Date(dateRangeFilter.end);
      headerDateRange.innerHTML = `${formatShortDatePt(s)} até ${formatShortDatePt(e)} <span class="arrow-down">&#9662;</span>`;
    } else {
      headerDateRange.innerHTML = `Todas as datas <span class="arrow-down">&#9662;</span>`;
    }
  }

  function renderCalendarDays() {
    if (!calDaysGrid) return;
    const year = calendarViewDate.getFullYear();
    const month = calendarViewDate.getMonth();

    if (calMonthDisplay) calMonthDisplay.textContent = monthNamesLongPt[month];
    if (calYearDisplay) calYearDisplay.textContent = year;

    // First day of month (0 = Sun, 1 = Mon ... 6 = Sat)
    const firstDay = new Date(year, month, 1).getDay();
    // Convert so Monday = 0, Sunday = 6
    const firstDayOffset = (firstDay + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    calDaysGrid.innerHTML = '';

    // Empty lead cells
    for (let i = 0; i < firstDayOffset; i++) {
      const emptyCell = document.createElement('div');
      emptyCell.className = 'cal-day-cell empty';
      calDaysGrid.appendChild(emptyCell);
    }

    const { start, end } = dateRangeFilter;

    // Days 1..daysInMonth
    for (let day = 1; day <= daysInMonth; day++) {
      const cellTime = new Date(year, month, day).getTime();
      const cell = document.createElement('div');
      cell.className = 'cal-day-cell';
      cell.textContent = day;

      const isStart = start !== null && cellTime === start;
      const isEnd = end !== null && cellTime === end;
      const inRange = start !== null && end !== null && cellTime > start && cellTime < end;

      if (isStart) cell.classList.add('range-start');
      if (isEnd) cell.classList.add('range-end');
      if (inRange) cell.classList.add('in-range');

      cell.addEventListener('click', () => {
        handleDayClick(cellTime);
      });

      calDaysGrid.appendChild(cell);
    }
  }

  function handleDayClick(timestamp) {
    if (tempClickState === null) {
      // First click: sets start date
      tempClickState = timestamp;
      dateRangeFilter.start = timestamp;
      dateRangeFilter.end = timestamp;
    } else {
      // Second click: sets range
      if (timestamp < tempClickState) {
        dateRangeFilter.start = timestamp;
        dateRangeFilter.end = tempClickState;
      } else {
        dateRangeFilter.start = tempClickState;
        dateRangeFilter.end = timestamp;
      }
      tempClickState = null;
      // Close popover on selection completion
      closeCalendarPopover();
    }
    updateDateBadgeDisplay();
    renderCalendarDays();
    updateFilterOptions();
    applyFiltersAndUpdateMetrics();
  }

  function openCalendarPopover() {
    if (!calendarPopover) return;
    calendarPopover.classList.add('show');
    if (dateBadgeBtn) dateBadgeBtn.classList.add('active');
    renderCalendarDays();
  }

  function closeCalendarPopover() {
    if (!calendarPopover) return;
    calendarPopover.classList.remove('show');
    if (dateBadgeBtn) dateBadgeBtn.classList.remove('active');
    tempClickState = null;
  }

  // Toggle calendar popup
  if (dateBadgeBtn) {
    dateBadgeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (calendarPopover && calendarPopover.classList.contains('show')) {
        closeCalendarPopover();
      } else {
        openCalendarPopover();
      }
    });
  }

  if (calendarPopover) {
    calendarPopover.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  document.addEventListener('click', (e) => {
    if (calendarPopover && calendarPopover.classList.contains('show')) {
      if (!calendarPopover.contains(e.target) && !dateBadgeBtn.contains(e.target)) {
        closeCalendarPopover();
      }
    }
  });

  if (calPrevMonth) {
    calPrevMonth.addEventListener('click', () => {
      calendarViewDate.setMonth(calendarViewDate.getMonth() - 1);
      renderCalendarDays();
    });
  }

  if (calNextMonth) {
    calNextMonth.addEventListener('click', () => {
      calendarViewDate.setMonth(calendarViewDate.getMonth() + 1);
      renderCalendarDays();
    });
  }

  // Preset buttons
  if (presetThisMonth) {
    presetThisMonth.addEventListener('click', () => {
      const now = new Date(calendarViewDate);
      const start = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).getTime();
      dateRangeFilter = { start, end };
      tempClickState = null;
      updateDateBadgeDisplay();
      renderCalendarDays();
      updateFilterOptions();
      applyFiltersAndUpdateMetrics();
      closeCalendarPopover();
    });
  }

  if (presetThisYear) {
    presetThisYear.addEventListener('click', () => {
      const year = calendarViewDate.getFullYear();
      const start = new Date(year, 0, 1).getTime();
      const end = new Date(year, 11, 31).getTime();
      dateRangeFilter = { start, end };
      tempClickState = null;
      updateDateBadgeDisplay();
      renderCalendarDays();
      updateFilterOptions();
      applyFiltersAndUpdateMetrics();
      closeCalendarPopover();
    });
  }

  if (presetAllTime) {
    presetAllTime.addEventListener('click', () => {
      dateRangeFilter = { start: null, end: null };
      tempClickState = null;
      updateDateBadgeDisplay();
      renderCalendarDays();
      updateFilterOptions();
      applyFiltersAndUpdateMetrics();
      closeCalendarPopover();
    });
  }

  // Check if a row matches active filter selections, optionally ignoring one specific field
  function rowMatchesFilters(row, ignoreKey = null) {
    const idAuditoria = String(getVal(row, 'ID Auditoria') || '').trim();
    if (!idAuditoria || idAuditoria === '#REF!' || idAuditoria === '-') return false;

    // 1. Date filter checking on 'Data Contato'
    if (dateRangeFilter.start !== null && dateRangeFilter.end !== null) {
      const dateRaw = getVal(row, 'Data Contato') || getVal(row, 'Data contato') || getVal(row, 'Data Preventiva');
      const parsed = parseFullDate(dateRaw);
      if (parsed) {
        if (parsed.timestamp < dateRangeFilter.start || parsed.timestamp > dateRangeFilter.end) {
          return false;
        }
      }
    }

    // 2. Dropdown filters checking
    for (const key of filterKeys) {
      if (ignoreKey && key === ignoreKey) continue;
      const el = filterSelects[key];
      const selectedVal = el ? el.value.trim() : '';
      if (selectedVal) {
        const rowVal = String(getVal(row, filterColMap[key]) || '').trim();
        if (rowVal !== selectedVal) return false;
      }
    }
    return true;
  }

  // Populate or adapt dropdown options dynamically based on other active filters
  function updateFilterOptions() {
    if (!rawSheetRows || rawSheetRows.length === 0) return;

    filterKeys.forEach(targetKey => {
      const selectEl = filterSelects[targetKey];
      if (!selectEl) return;

      const currentSelected = selectEl.value;
      const availableValues = new Set();

      // Collect available options from rows that match ALL OTHER currently active filters
      rawSheetRows.forEach(row => {
        if (rowMatchesFilters(row, targetKey)) {
          const val = String(getVal(row, filterColMap[targetKey]) || '').trim();
          if (val && val !== '#REF!' && val !== '-') {
            availableValues.add(val);
          }
        }
      });

      const sorted = Array.from(availableValues).sort((a, b) => a.localeCompare(b, 'pt-BR', { numeric: true }));
      const defaultText = filterDefaultLabels[targetKey];

      selectEl.innerHTML = `<option value="">${defaultText}</option>`;
      let stillHasSelected = false;

      sorted.forEach(val => {
        const opt = document.createElement('option');
        opt.value = val;
        opt.textContent = val;
        if (val === currentSelected) {
          opt.selected = true;
          stillHasSelected = true;
        }
        selectEl.appendChild(opt);
      });

      // If previously selected value is no longer valid under new constraints, reset it
      if (currentSelected && !stillHasSelected) {
        selectEl.value = '';
      }
    });
  }

  // Attach change listeners to filters for chained cascading adaptation
  Object.keys(filterSelects).forEach(key => {
    const selectEl = filterSelects[key];
    if (selectEl) {
      selectEl.addEventListener('change', () => {
        if (rawSheetRows.length > 0) {
          // Re-evaluate options for all other dropdowns
          updateFilterOptions();
          // Update cards and bars
          applyFiltersAndUpdateMetrics();
        }
      });
    }
  });

  const chartYearSelect = document.getElementById('chartYearSelect');

  // Populate chart year dropdown with distinct years from 'Data Contato'
  function populateChartYearOptions(rows) {
    if (!chartYearSelect) return;
    const yearsSet = new Set();
    rows.forEach(r => {
      const parsed = parseDateToMonthYear(getVal(r, 'Data Contato') || getVal(r, 'Data contato') || getVal(r, 'Data Preventiva'));
      if (parsed && parsed.year) {
        yearsSet.add(parsed.year);
      }
    });

    const currentSelected = chartYearSelect.value;
    const sortedYears = Array.from(yearsSet).sort((a, b) => b - a); // descending order

    chartYearSelect.innerHTML = `<option value="">Todos os anos</option>`;
    sortedYears.forEach(yr => {
      const opt = document.createElement('option');
      opt.value = String(yr);
      opt.textContent = String(yr);
      if (String(yr) === currentSelected) {
        opt.selected = true;
      }
      chartYearSelect.appendChild(opt);
    });
  }

  if (chartYearSelect) {
    chartYearSelect.addEventListener('change', () => {
      if (rawSheetRows.length > 0) {
        calculateQualityEvolutionChart(rawSheetRows);
      }
    });
  }

  function processSheetData(rows) {
    rawSheetRows = rows;
    
    // Reset all filters to default empty
    filterKeys.forEach(k => {
      if (filterSelects[k]) filterSelects[k].value = '';
    });

    // Populate chart year options
    populateChartYearOptions(rows);

    // Detect min and max contact dates in the spreadsheet to initialize calendar
    let minTime = null;
    let maxTime = null;
    rows.forEach(r => {
      const d = parseFullDate(getVal(r, 'Data Contato') || getVal(r, 'Data contato') || getVal(r, 'Data Preventiva'));
      if (d) {
        if (minTime === null || d.timestamp < minTime) minTime = d.timestamp;
        if (maxTime === null || d.timestamp > maxTime) maxTime = d.timestamp;
      }
    });

    if (minTime !== null && maxTime !== null) {
      dateRangeFilter = { start: minTime, end: maxTime };
      calendarViewDate = new Date(maxTime);
    } else {
      dateRangeFilter = { start: null, end: null };
    }
    updateDateBadgeDisplay();

    // Populate initial cascading options
    updateFilterOptions();

    // 1. Calculate 'Evolução da qualidade' using ALL rows (exempt from filters)
    calculateQualityEvolutionChart(rows);

    // 2. Calculate Cards (NPS, Satisfação, Qualidade, Problemas, Auditorias)
    // and 'Qualidade por etapa do serviço' with active filters
    applyFiltersAndUpdateMetrics();
  }

  function calculateQualityEvolutionChart(rows) {
    const selectedYear = chartYearSelect ? chartYearSelect.value.trim() : '';
    const monthlyGroups = new Map();

    rows.forEach(row => {
      const idAuditoria = String(getVal(row, 'ID Auditoria') || '').trim();
      if (!idAuditoria || idAuditoria === '#REF!' || idAuditoria === '-') return;

      const dateRaw = getVal(row, 'Data Contato') || getVal(row, 'Data contato') || getVal(row, 'Data Preventiva');
      const dateParsed = parseDateToMonthYear(dateRaw);
      if (!dateParsed) return;

      // Filter by selected year if any
      if (selectedYear && String(dateParsed.year) !== selectedYear) {
        return;
      }

      const satRaw = getVal(row, 'Q10 Satisfação (0-10)') || getVal(row, 'Q10') || getVal(row, 'Q1');
      const satNum = parseNum(satRaw);
      const hasSat = !isNaN(satNum);

      const qualRaw = getVal(row, 'Índice Qualidade');
      const qualNum = parseNum(qualRaw);
      const hasQual = !isNaN(qualNum) && (qualNum > 0 || hasSat);

      const q5Val = String(getVal(row, 'Q5 Ficou problema?') || getVal(row, 'Q5') || '').trim().toLowerCase();
      const isProblem = q5Val === 'sim';

      const { month, year, sortKey } = dateParsed;
      const yearShort = String(year).slice(-2);
      const label = `${monthNamesPt[month - 1]}/${yearShort}`;

      if (!monthlyGroups.has(sortKey)) {
        monthlyGroups.set(sortKey, {
          sortKey,
          label,
          totalRows: 0,
          sumSat: 0,
          countSat: 0,
          sumQual: 0,
          countQual: 0,
          countProb: 0
        });
      }

      const grp = monthlyGroups.get(sortKey);
      grp.totalRows++;
      if (hasSat) {
        grp.sumSat += satNum;
        grp.countSat++;
      }
      if (hasQual) {
        grp.sumQual += qualNum;
        grp.countQual++;
      }
      if (isProblem) {
        grp.countProb++;
      }
    });

    if (monthlyGroups.size > 0) {
      const sortedKeys = Array.from(monthlyGroups.keys()).sort((a, b) => a - b);
      const newLabels = [];
      const newQualityData = [];
      const newSatisfactionData = [];
      const newProblemsData = [];
      const newRealSat = [];

      sortedKeys.forEach(key => {
        const grp = monthlyGroups.get(key);
        newLabels.push(grp.label);

        const mQual = grp.countQual > 0 ? (grp.sumQual / grp.countQual) : null;
        newQualityData.push(mQual !== null ? Number(mQual.toFixed(1)) : null);

        const mSat = grp.countSat > 0 ? (grp.sumSat / grp.countSat) : null;
        if (mSat !== null) {
          newRealSat.push(Number(mSat.toFixed(1)));
          newSatisfactionData.push(Number((mSat * 10).toFixed(1)));
        } else {
          newRealSat.push(null);
          newSatisfactionData.push(null);
        }

        const mProb = grp.totalRows > 0 ? ((grp.countProb / grp.totalRows) * 100) : 0;
        newProblemsData.push(Number(mProb.toFixed(1)));
      });

      lastRealSatisfactionValues = newRealSat;

      chart.data.labels = newLabels;
      chart.data.datasets[0].data = newQualityData;
      chart.data.datasets[1].data = newSatisfactionData;
      chart.data.datasets[2].data = newProblemsData;
      chart.update();
    }
  }

  function applyFiltersAndUpdateMetrics() {
    const selectedLoja = filterSelects.loja ? filterSelects.loja.value.trim() : '';
    const selectedUF = filterSelects.uf ? filterSelects.uf.value.trim() : '';
    const selectedRegional = filterSelects.regional ? filterSelects.regional.value.trim() : '';
    const selectedAnalista = filterSelects.analista ? filterSelects.analista.value.trim() : '';
    const selectedFornecedor = filterSelects.fornecedor ? filterSelects.fornecedor.value.trim() : '';
    const selectedModalidade = filterSelects.modalidade ? filterSelects.modalidade.value.trim() : '';

    let totalAuditorias = 0;
    let countPromoters = 0;
    let countNeutrals = 0;
    let countDetractors = 0;

    let sumSatisfaction = 0;
    let countSatisfaction = 0;

    let sumQuality = 0;
    let countQuality = 0;

    let countProblemsSim = 0;

    const stageScores = {
      q2: { sum: 0, count: 0 },
      q3: { sum: 0, count: 0 },
      q4: { sum: 0, count: 0 },
      q5: { sum: 0, count: 0 },
      q6: { sum: 0, count: 0 }
    };

    rawSheetRows.forEach(row => {
      const idAuditoria = String(getVal(row, 'ID Auditoria') || '').trim();
      if (!idAuditoria || idAuditoria === '#REF!' || idAuditoria === '-') {
        return;
      }

      // Check date filter (Data Contato)
      if (dateRangeFilter.start !== null && dateRangeFilter.end !== null) {
        const dateRaw = getVal(row, 'Data Contato') || getVal(row, 'Data contato') || getVal(row, 'Data Preventiva');
        const parsed = parseFullDate(dateRaw);
        if (parsed) {
          if (parsed.timestamp < dateRangeFilter.start || parsed.timestamp > dateRangeFilter.end) {
            return;
          }
        }
      }

      // Check filters: Loja, UF, Regional, Analista, Fornecedor, Modalidade
      if (selectedLoja && String(getVal(row, 'Loja') || '').trim() !== selectedLoja) return;
      if (selectedUF && String(getVal(row, 'UF') || '').trim() !== selectedUF) return;
      if (selectedRegional && String(getVal(row, 'Regional') || '').trim() !== selectedRegional) return;
      if (selectedAnalista && String(getVal(row, 'Analista') || '').trim() !== selectedAnalista) return;
      if (selectedFornecedor && String(getVal(row, 'Fornecedor') || '').trim() !== selectedFornecedor) return;
      if (selectedModalidade && String(getVal(row, 'Modalidade') || '').trim() !== selectedModalidade) return;

      totalAuditorias++;

      // Card 1: NPS = % Promotores - % Detratores
      const npsClass = String(getVal(row, 'Classificação NPS') || '').trim().toLowerCase();
      if (npsClass.includes('promotor')) {
        countPromoters++;
      } else if (npsClass.includes('neutro')) {
        countNeutrals++;
      } else if (npsClass.includes('detrator')) {
        countDetractors++;
      }

      // Satisfação média: Coluna 'Q10 Satisfação (0-10)'
      const satRaw = getVal(row, 'Q10 Satisfação (0-10)') || getVal(row, 'Q10') || getVal(row, 'Q1');
      const satNum = parseNum(satRaw);
      const hasSat = !isNaN(satNum);
      if (hasSat) {
        sumSatisfaction += satNum;
        countSatisfaction++;
      }

      // Índice de Qualidade: Coluna 'Índice Qualidade'
      const qualRaw = getVal(row, 'Índice Qualidade');
      const qualNum = parseNum(qualRaw);
      const hasQual = !isNaN(qualNum) && (qualNum > 0 || hasSat);
      if (hasQual) {
        sumQuality += qualNum;
        countQuality++;
      }

      // % Problemas: Coluna 'Q5 Ficou problema?'
      const q5Val = String(getVal(row, 'Q5 Ficou problema?') || getVal(row, 'Q5') || '').trim().toLowerCase();
      if (q5Val === 'sim') {
        countProblemsSim++;
      }

      // Qualidade por etapa do serviço (Q2 Pontos até Q6 Pontos)
      const q2p = parseNum(getVal(row, 'Q2 Pontos'));
      if (!isNaN(q2p)) {
        stageScores.q2.sum += q2p;
        stageScores.q2.count++;
      }

      const q3p = parseNum(getVal(row, 'Q3 Pontos'));
      if (!isNaN(q3p)) {
        stageScores.q3.sum += q3p;
        stageScores.q3.count++;
      }

      const q4p = parseNum(getVal(row, 'Q4 Pontos'));
      if (!isNaN(q4p)) {
        stageScores.q4.sum += q4p;
        stageScores.q4.count++;
      }

      const q5p = parseNum(getVal(row, 'Q5 Pontos'));
      if (!isNaN(q5p)) {
        stageScores.q5.sum += q5p;
        stageScores.q5.count++;
      }

      const q6p = parseNum(getVal(row, 'Q6 Pontos'));
      if (!isNaN(q6p)) {
        stageScores.q6.sum += q6p;
        stageScores.q6.count++;
      }
    });

    // 1. NPS
    const totalNPSResp = countPromoters + countNeutrals + countDetractors;
    let npsScore = 0;
    let pctPromoters = 0;
    let pctNeutrals = 0;
    let pctDetractors = 0;

    if (totalNPSResp > 0) {
      pctPromoters = (countPromoters / totalNPSResp) * 100;
      pctNeutrals = (countNeutrals / totalNPSResp) * 100;
      pctDetractors = (countDetractors / totalNPSResp) * 100;
      npsScore = Math.round(pctPromoters - pctDetractors);
    }

    // 2. Satisfação média
    const avgSatisfaction = countSatisfaction > 0 ? (sumSatisfaction / countSatisfaction) : 0;

    // 3. Índice de Qualidade
    const avgQuality = countQuality > 0 ? (sumQuality / countQuality) : 0;

    // 4. Serviços com problema
    const pctProblemas = totalAuditorias > 0 ? ((countProblemsSim / totalAuditorias) * 100) : 0;

    // --- Update KPI Cards UI ---
    const kpiNpsValue = document.getElementById('kpiNpsValue');
    if (kpiNpsValue) kpiNpsValue.textContent = totalNPSResp > 0 ? npsScore : '-';

    const npsPctPromoters = document.getElementById('npsPctPromoters');
    const npsPctNeutrals = document.getElementById('npsPctNeutrals');
    const npsPctDetractors = document.getElementById('npsPctDetractors');
    if (npsPctPromoters) npsPctPromoters.textContent = Math.round(pctPromoters) + '%';
    if (npsPctNeutrals) npsPctNeutrals.textContent = Math.round(pctNeutrals) + '%';
    if (npsPctDetractors) npsPctDetractors.textContent = Math.round(pctDetractors) + '%';

    const npsCountPromoters = document.getElementById('npsCountPromoters');
    const npsCountNeutrals = document.getElementById('npsCountNeutrals');
    const npsCountDetractors = document.getElementById('npsCountDetractors');
    if (npsCountPromoters) npsCountPromoters.textContent = `(${countPromoters.toLocaleString('pt-BR')})`;
    if (npsCountNeutrals) npsCountNeutrals.textContent = `(${countNeutrals.toLocaleString('pt-BR')})`;
    if (npsCountDetractors) npsCountDetractors.textContent = `(${countDetractors.toLocaleString('pt-BR')})`;

    // Update NPS Donut/Pie Chart
    if (npsPieChart) {
      if (totalNPSResp > 0) {
        npsPieChart.data.datasets[0].data = [
          Number(pctPromoters.toFixed(1)),
          Number(pctNeutrals.toFixed(1)),
          Number(pctDetractors.toFixed(1))
        ];
      } else {
        npsPieChart.data.datasets[0].data = [0, 0, 0];
      }
      npsPieChart.update();
    }

    const kpiSatisfactionValue = document.getElementById('kpiSatisfactionValue');
    if (kpiSatisfactionValue) {
      kpiSatisfactionValue.textContent = countSatisfaction > 0 ? avgSatisfaction.toFixed(1).replace('.', ',') : '-';
    }

    const kpiQualityValue = document.getElementById('kpiQualityValue');
    if (kpiQualityValue) {
      kpiQualityValue.textContent = countQuality > 0 ? (Math.round(avgQuality) + '%') : '-';
    }

    const kpiProblemsValue = document.getElementById('kpiProblemsValue');
    if (kpiProblemsValue) {
      kpiProblemsValue.textContent = totalAuditorias > 0 ? (pctProblemas.toFixed(1).replace('.', ',') + '%') : '-';
    }

    const kpiAuditsValue = document.getElementById('kpiAuditsValue');
    if (kpiAuditsValue) {
      kpiAuditsValue.textContent = totalAuditorias.toLocaleString('pt-BR');
    }

    // --- Update Horizontal Bars: Qualidade por etapa do serviço ---
    const updateBar = (fillId, valId, scoreObj) => {
      const fillEl = document.getElementById(fillId);
      const valEl = document.getElementById(valId);
      if (fillEl && valEl) {
        if (scoreObj.count > 0) {
          const avg = Math.round(scoreObj.sum / scoreObj.count);
          const clamped = Math.max(0, Math.min(100, avg));
          fillEl.style.width = clamped + '%';
          valEl.textContent = clamped + '%';
        } else {
          fillEl.style.width = '0%';
          valEl.textContent = '-';
        }
      }
    };

    updateBar('barStepFillQ2', 'barStepValQ2', stageScores.q2);
    updateBar('barStepFillQ3', 'barStepValQ3', stageScores.q3);
    updateBar('barStepFillQ4', 'barStepValQ4', stageScores.q4);
    updateBar('barStepFillQ5', 'barStepValQ5', stageScores.q5);
    updateBar('barStepFillQ6', 'barStepValQ6', stageScores.q6);

    // Visual feedback in file subtext
    if (fileSelectSub) {
      fileSelectSub.textContent = `Exibindo ${totalAuditorias.toLocaleString('pt-BR')} auditorias filtradas`;
      fileSelectSub.style.color = '#16a34a';
      fileSelectSub.style.fontWeight = '600';
    }
  }
});
