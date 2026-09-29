/**
 * @file budget.js
 * @description Fiscal Year Budget Tracking, Allocation & Expenses Management
 * Module: budget/budget
 */

import { fetchWithAuth, API_BASE } from '../core/api.js';
import { state } from '../core/state.js';
import { formatCurrency } from '../core/utils.js';
import { getCurrentRoleLevel } from '../rbac/rbac.js';

// Fetch current laboratory budget
export async function fetchBudget() {
  try {
    const res = await fetch(`${API_BASE}/budget`);
    if (res.ok) {
      const data = await res.json();
      if (data && (data.budget !== undefined || data.total !== undefined)) {
        const total = parseFloat(data.budget || data.total || 250000);
        state.budget.total = total;
        state.budget.spent = parseFloat(data.spent || 0);
        state.budget.remaining = Math.max(0, total - state.budget.spent);
        renderBudgetOverview();
        return state.budget;
      }
    }
  } catch (err) {
    console.warn("[Budget] Could not fetch budget:", err.message);
  }

  renderBudgetOverview();
  return state.budget;
}

// Update budget amount (L3 Admin only)
export async function updateBudgetAmount(newTotal) {
  const role = getCurrentRoleLevel();
  if (role !== 'L3') {
    throw new Error('เฉพาะผู้ดูแลระบบ (L3 Admin) เท่านั้นที่สามารถแก้ไขงบประมาณได้');
  }

  const num = parseFloat(newTotal);
  if (isNaN(num) || num < 0) {
    throw new Error('กรุณาระบุจำนวนงบประมาณที่ถูกต้อง');
  }

  const res = await fetchWithAuth(`${API_BASE}/budget`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ budget: num, total: num })
  });

  if (!res.ok) {
    throw new Error('ไม่สามารถบันทึกงบประมาณได้');
  }

  state.budget.total = num;
  state.budget.remaining = Math.max(0, num - state.budget.spent);
  renderBudgetOverview();
  return state.budget;
}

// Render Budget Overview UI
export function renderBudgetOverview() {
  const totalElem = document.getElementById("statBudgetTotal");
  const spentElem = document.getElementById("statBudgetSpent");
  const remainingElem = document.getElementById("statBudgetRemaining");
  const progressElem = document.getElementById("budgetProgressBar");

  const total = state.budget.total || 250000;
  const spent = state.budget.spent || 0;
  const remaining = Math.max(0, total - spent);
  const percentage = total > 0 ? Math.min(100, Math.round((spent / total) * 100)) : 0;

  if (totalElem) totalElem.innerText = `${formatCurrency(total)} บาท`;
  if (spentElem) spentElem.innerText = `${formatCurrency(spent)} บาท`;
  if (remainingElem) remainingElem.innerText = `${formatCurrency(remaining)} บาท`;
  if (progressElem) {
    progressElem.style.width = `${percentage}%`;
    progressElem.setAttribute("aria-valuenow", percentage);
  }
}

// Mount to window for global backwards compatibility
if (typeof window !== 'undefined') {
  window.fetchBudget = fetchBudget;
  window.updateBudgetAmount = updateBudgetAmount;
  window.renderBudgetOverview = renderBudgetOverview;
}
