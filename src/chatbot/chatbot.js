/**
 * @file chatbot.js
 * @description "Bitol" AI Laboratory Assistant, SDS & Chemical Safety Lookup
 * Module: chatbot/chatbot
 */

import { state } from '../core/state.js';
import { escapeHtml } from '../core/utils.js';

// Toggle Chatbot Window
export function toggleChatbot() {
  const chatWindow = document.getElementById("chatbotWindow");
  if (!chatWindow) return;

  chatWindow.classList.toggle("active");
  const input = document.getElementById("chatbotInput");
  if (chatWindow.classList.contains("active") && input) {
    input.focus();
  }
}

// Send message to AI Assistant
export async function sendChatMessage(userMessage) {
  if (!userMessage || !userMessage.trim()) return;
  const msg = userMessage.trim();

  appendChatMessage("user", msg);
  const input = document.getElementById("chatbotInput");
  if (input) input.value = "";

  // Show typing indicator
  const typingId = appendTypingIndicator();

  // Generate Answer locally or with AI helper
  setTimeout(() => {
    removeTypingIndicator(typingId);
    const reply = generateAssistantReply(msg);
    appendChatMessage("bot", reply);
  }, 600);
}

// Append message bubble
function appendChatMessage(sender, text) {
  const container = document.getElementById("chatbotMessages");
  if (!container) return;

  const bubble = document.createElement("div");
  bubble.className = `chat-bubble chat-bubble-${sender}`;
  bubble.style.cssText = `
    margin-bottom: 12px;
    display: flex;
    justify-content: ${sender === 'user' ? 'flex-end' : 'flex-start'};
  `;

  bubble.innerHTML = `
    <div style="
      max-width: 80%;
      padding: 10px 14px;
      border-radius: ${sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px'};
      background: ${sender === 'user' ? 'linear-gradient(135deg, #6366f1, #7c3aed)' : '#f1f5f9'};
      color: ${sender === 'user' ? '#ffffff' : '#1e293b'};
      font-size: 13.5px;
      line-height: 1.5;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    ">
      ${escapeHtml(text)}
    </div>
  `;

  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;
}

function appendTypingIndicator() {
  const container = document.getElementById("chatbotMessages");
  if (!container) return null;
  const id = `typing-${Date.now()}`;
  const typing = document.createElement("div");
  typing.id = id;
  typing.style.cssText = "display: flex; margin-bottom: 12px; padding: 6px 12px; color: #94a3b8; font-size: 12px; font-style: italic;";
  typing.innerText = "Bitol กำลังคิดคำตอบ...";
  container.appendChild(typing);
  container.scrollTop = container.scrollHeight;
  return id;
}

function removeTypingIndicator(id) {
  if (!id) return;
  const el = document.getElementById(id);
  if (el) el.remove();
}

// Smart local FAQ & SDS responder
function generateAssistantReply(query) {
  const q = query.toLowerCase();

  // Search items in stock
  if (q.includes("มี") || q.includes("หา") || q.includes("สาร") || q.includes("อุปกรณ์") || q.includes("ตู้")) {
    const found = state.items.filter(it => 
      (it.name && it.name.toLowerCase().includes(q.replace(/(มี|หา|สาร|ในห้อง|ในแล็บ)/g, '').trim()))
    );

    if (found.length > 0) {
      const top = found[0];
      return `พบข้อมูล: "${top.name}" (${top.code}) จัดเก็บอยู่ที่ห้อง ${top.room || 'Lab 1'} > ${top.cabinet || '-'} (ชั้น ${top.shelf || '-'}) มียอดคงเหลือ ${top.quantity || top.qty || 0} ${top.unit || 'ชิ้น'}`;
    }
  }

  if (q.includes("จองห้อง") || q.includes("booking")) {
    return "ท่านสามารถจองห้องปฏิบัติการได้ที่เมนู 'จองห้องปฏิบัติการ' ทางแถบด้านซ้าย โดยเลือกระบุวันที่ ช่วงเวลา และวัตถุประสงค์การใช้งานครับ";
  }

  if (q.includes("ยืม") || q.includes("คืน")) {
    return "ท่านสามารถทำรายการยืมสารเคมีหรืออุปกรณ์ได้ที่เมนู 'ยืม-คืนพัสดุ' หรือสแกน QR Code ประจำพัสดุเพื่อทำรายการด่วนได้ทันทีครับ";
  }

  if (q.includes("shecu") || q.includes("ความปลอดภัย") || q.includes("sds")) {
    return "ระบบ SciPortal จัดเก็บสารเคมีตามมาตรฐานความปลอดภัย SHECU จุฬาฯ โดยแยกเก็บตามความเข้ากันได้ของสารเคมี (Compatibility Groups) และมีเอกสารข้อมูลความปลอดภัย SDS ทุกรายการครับ";
  }

  return "สวัสดีครับ ผมบิทอล (Bitol) ผู้ช่วยห้องปฏิบัติการอัจฉริยะ สามารถสอบถามตำแหน่งที่เก็บสารเคมี, วิธีจองห้องแล็บ, หรือมาตรฐานความปลอดภัย SHECU ได้ตลอดเวลาครับ!";
}

// Mount to window for global backwards compatibility
if (typeof window !== 'undefined') {
  window.toggleChatbot = toggleChatbot;
  window.sendChatMessage = sendChatMessage;
}
