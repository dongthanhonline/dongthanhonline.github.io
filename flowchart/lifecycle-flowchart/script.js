// Default Fallback Sample Data
const defaultJsonData = {
  "nodes": [
    { "id": "1", "event_name": "membership.signup", "note": "Status: active" },
    { "id": "2", "event_name": "payment_failed", "note": "Status: past_due" },
    { "id": "3", "event_name": "payment_succeeded", "note": "Status: active" },
    { "id": "4", "event_name": "cancelled", "note": "Status: cancelled" }
  ],
  "edges": [
    { "from": "1", "to": "2" },
    { "from": "1", "to": "4", "label": "User Cancelled" },
    { "from": "2", "to": "3" },
    { "from": "2", "to": "4", "label": "Max Retries Exceeded" },
    { "from": "3", "to": "4", "label": "User Cancelled" }
  ]
};

let editor;
let currentMermaidCode = '';

// Initialize Mermaid.js với cấu hình chống tràn
mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  flowchart: {
    useMaxWidth: false, // QUAN TRỌNG: Tắt ép chiều rộng tối đa để SVG không bị bóp méo
    htmlLabels: true,
    curve: 'basis',
    nodeSpacing: 50,
    rankSpacing: 60
  }
});

// Helper: Escape HTML string to avoid injection in labels
function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Convert JSON structure into Mermaid Syntax
function jsonToMermaid(data) {
  if (!data || !Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
    throw new Error("JSON structure must contain 'nodes' and 'edges' arrays.");
  }

  let code = "graph TD\n";

  // Define Nodes
  data.nodes.forEach(node => {
    const eventName = escapeHtml(node.event_name || '');
    const note = escapeHtml(node.note || '');
    
    // Formatting content inside node box
    const label = `"${eventName}<br/><span style='font-size:11px;opacity:0.8;'>(${note})</span>"`;
    code += `  node_${node.id}[${label}]\n`;
  });

  // Define Edges/Connections
  data.edges.forEach(edge => {
    if (edge.label && edge.label.trim() !== '') {
      const edgeLabel = escapeHtml(edge.label);
      code += `  node_${edge.from} -->|"${edgeLabel}"| node_${edge.to}\n`;
    } else {
      code += `  node_${edge.from} --> node_${edge.to}\n`;
    }
  });

  return code;
}

// Render Flowchart to UI
async function renderDiagram(jsonString) {
  const statusEl = document.getElementById('json-status');
  const outputEl = document.getElementById('mermaid-output');

  try {
    const data = JSON.parse(jsonString);
    
    // Update status badge: Valid JSON
    statusEl.className = 'text-xs px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1.5';
    statusEl.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Valid JSON';

    // Generate Mermaid Code
    currentMermaidCode = jsonToMermaid(data);

    // Render using Mermaid
    outputEl.removeAttribute('data-processed');
    outputEl.innerHTML = '';
    
    const { svg } = await mermaid.render('mermaid-svg-instance', currentMermaidCode);
    outputEl.innerHTML = svg;

  } catch (err) {
    // Update status badge: Invalid JSON
    statusEl.className = 'text-xs px-2.5 py-1 rounded-full bg-rose-950 text-rose-400 border border-rose-800 flex items-center gap-1.5';
    statusEl.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-rose-400"></span> Syntax Error';
  }
}

// Show Toast Notification
function showToast(message) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-msg');
  toastMsg.innerText = message;
  toast.classList.remove('opacity-0');
  toast.classList.add('opacity-100');
  
  setTimeout(() => {
    toast.classList.remove('opacity-100');
    toast.classList.add('opacity-0');
  }, 2500);
}

// Initialize Page & Load Initial JSON Data
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize CodeMirror Editor
  const textarea = document.getElementById('json-input');
  editor = CodeMirror.fromTextArea(textarea, {
    mode: { name: "javascript", json: true },
    theme: "dracula",
    lineNumbers: true,
    tabSize: 2,
    lineWrapping: true
  });

  // Try fetching external data.json file first
  let initialJsonContent = '';
  try {
    const response = await fetch('data.json');
    if (response.ok) {
      const jsonObject = await response.json();
      initialJsonContent = JSON.stringify(jsonObject, null, 2);
    } else {
      initialJsonContent = JSON.stringify(defaultJsonData, null, 2);
    }
  } catch (e) {
    initialJsonContent = JSON.stringify(defaultJsonData, null, 2);
  }

  // Set editor value & render
  editor.setValue(initialJsonContent);
  renderDiagram(initialJsonContent);

  // Auto Render on Change (Debounce)
  let timer;
  editor.on('change', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      renderDiagram(editor.getValue());
    }, 400);
  });

  // Button Action: Reset Sample
  document.getElementById('btn-reset').addEventListener('click', () => {
    const resetContent = JSON.stringify(defaultJsonData, null, 2);
    editor.setValue(resetContent);
    renderDiagram(resetContent);
    showToast('Reset to default sample data');
  });

  // Button Action: Copy Mermaid Code
  document.getElementById('btn-copy-mermaid').addEventListener('click', () => {
    if (currentMermaidCode) {
      navigator.clipboard.writeText(currentMermaidCode);
      showToast('Mermaid syntax copied to clipboard!');
    }
  });
});
