// Dữ liệu mẫu dự phòng (Tránh lỗi Undefined khi không load được data.json)
const defaultJsonData = {
  "nodes": [
    {
      "id": "1",
      "event_name": "membership.signup",
      "note": "Status: active"
    },
    {
      "id": "2",
      "event_name": "payment_succeeded",
      "note": "Status: active"
    },
    {
      "id": "3",
      "event_name": "payment_failed",
      "note": "Status: past_due"
    }
  ],
  "edges": [
    {
      "from": "1",
      "to": "2",
      "label": "Next month"
    },
    {
      "from": "1",
      "to": "3",
      "label": "Fail payment"
    }
  ]
};

const systemPromptText = `Bạn là một JSON Workflow Parser chuyên nghiệp. Nhiệm vụ của bạn là đọc mô tả quy trình (Workflow / State Machine) dạng Markdown hoặc văn bản do người dùng cung cấp và chuyển đổi thành một đối tượng JSON chuẩn theo đúng Schema bên dưới.

### Yêu cầu đầu ra (JSON Schema Rules):
1. Cấu trúc JSON chỉ bao gồm 2 mảng chính: \`nodes\` và \`edges\`.
2. Mảng \`nodes\`: Mỗi node đại diện cho một trạng thái / sự kiện / bước trong workflow.
   - \`id\`: Chuỗi định danh duy nhất (ví dụ: "1", "2", "3" hoặc slug tên event).
   - \`event_name\`: Tên ngắn gọn của sự kiện hoặc trạng thái (ví dụ: "membership.signup", "payment_failed").
   - \`note\`: Thông tin phụ, trạng thái liên quan (ví dụ: "Status: active", "Status: past_due").
3. Mảng \`edges\`: Mỗi edge đại diện cho luồng chuyển đổi (transition) giữa 2 node.
   - \`from\`: ID của node bắt đầu.
   - \`to\`: ID của node kết thúc.
   - \`label\`: Điều kiện hoặc hành động kích hoạt sự dịch chuyển (ví dụ: "Fail payment", "User Cancelled").
4. CHỈ TRẢ VỀ DUY NHẤT ĐOẠN MÃ JSON (Không thêm lời dẫn, không giải thích, không dùng markdown block thừa ngoài code block json).

---

### Mẫu JSON mong muốn (Output Format Example):
{
  "nodes": [
    {
      "id": "1",
      "event_name": "membership.signup",
      "note": "Status: active"
    },
    {
      "id": "2",
      "event_name": "payment_succeeded",
      "note": "Status: active"
    }
  ],
  "edges": [
    {
      "from": "1",
      "to": "2",
      "label": "Next month"
    }
  ]
}

---

Dưới đây là nội dung Workflow Markdown của tôi, hãy trích xuất và trả về JSON tương ứng:
[DÁN NỘI DUNG MARKDOWN WORKFLOW CỦA BẠN VÀO ĐÂY]`;

let editor;
let currentMermaidCode = '';

function copySystemPrompt() {
  navigator.clipboard.writeText(systemPromptText).then(() => {
    const btn = document.getElementById('btn-copy-prompt');
    const btnText = document.getElementById('prompt-btn-text');
    if (!btn || !btnText) return;
    
    btnText.textContent = 'Copied!';
    btn.classList.remove('bg-indigo-600', 'hover:bg-indigo-500');
    btn.classList.add('bg-emerald-600');

    setTimeout(() => {
      btnText.textContent = 'Copy System Prompt';
      btn.classList.remove('bg-emerald-600');
      btn.classList.add('bg-indigo-600', 'hover:bg-indigo-500');
    }, 2000);
  }).catch(err => {
    console.error('Lỗi khi copy prompt: ', err);
  });
}

// Initialize Mermaid.js
mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  flowchart: {
    useMaxWidth: false,
    htmlLabels: true,
    curve: 'basis',
    nodeSpacing: 50,
    rankSpacing: 60
  }
});

function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function jsonToMermaid(data) {
  if (!data || !Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
    throw new Error("JSON structure must contain 'nodes' and 'edges' arrays.");
  }

  let code = "graph TD\n";

  data.nodes.forEach(node => {
    const eventName = escapeHtml(node.event_name || '');
    const note = escapeHtml(node.note || '');
    const label = `"${eventName}<br/><span style='font-size:11px;opacity:0.8;'>(${note})</span>"`;
    code += `  node_${node.id}[${label}]\n`;
  });

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

async function renderDiagram(jsonString) {
  const statusEl = document.getElementById('json-status');
  const outputEl = document.getElementById('mermaid-output');
  if (!outputEl) return;

  try {
    const data = JSON.parse(jsonString);
    
    if (statusEl) {
      statusEl.className = 'text-xs px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1.5';
      statusEl.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Valid JSON';
    }

    currentMermaidCode = jsonToMermaid(data);

    outputEl.removeAttribute('data-processed');
    outputEl.innerHTML = '';
    
    const { svg } = await mermaid.render('mermaid-svg-instance', currentMermaidCode);
    outputEl.innerHTML = svg;

  } catch (err) {
    if (statusEl) {
      statusEl.className = 'text-xs px-2.5 py-1 rounded-full bg-rose-950 text-rose-400 border border-rose-800 flex items-center gap-1.5';
      statusEl.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-rose-400"></span> Syntax Error';
    }
  }
}

function showToast(message) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-msg');
  if (!toast || !toastMsg) return;
  
  toastMsg.innerText = message;
  toast.classList.remove('opacity-0');
  toast.classList.add('opacity-100');
  
  setTimeout(() => {
    toast.classList.remove('opacity-100');
    toast.classList.add('opacity-0');
  }, 2500);
}

document.addEventListener('DOMContentLoaded', async () => {
  const textarea = document.getElementById('json-input');
  if (!textarea) return;

  editor = CodeMirror.fromTextArea(textarea, {
    mode: { name: "javascript", json: true },
    theme: "dracula",
    lineNumbers: true,
    tabSize: 2,
    lineWrapping: true
  });

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

  editor.setValue(initialJsonContent);
  renderDiagram(initialJsonContent);

  let timer;
  editor.on('change', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      renderDiagram(editor.getValue());
    }, 400);
  });

  const btnReset = document.getElementById('btn-reset');
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      const resetContent = JSON.stringify(defaultJsonData, null, 2);
      editor.setValue(resetContent);
      renderDiagram(resetContent);
      showToast('Reset to default sample data');
    });
  }

  const btnCopyMermaid = document.getElementById('btn-copy-mermaid');
  if (btnCopyMermaid) {
    btnCopyMermaid.addEventListener('click', () => {
      if (currentMermaidCode) {
        navigator.clipboard.writeText(currentMermaidCode);
        showToast('Mermaid syntax copied to clipboard!');
      }
    });
  }
});
